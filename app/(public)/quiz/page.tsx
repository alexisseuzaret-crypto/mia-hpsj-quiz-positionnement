'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  email: z.string().email('Email invalide').max(254, 'Email trop long'),
  service: z.string().trim().max(100).optional(),
  trainingFormat: z.enum(['presentiel', 'distanciel', 'indifferent'], {
    error: 'Veuillez choisir un format',
  }),
  rgpdConsent: z
    .boolean()
    .refine((val) => val === true, 'Le consentement est requis pour continuer'),
});

type FormValues = z.infer<typeof schema>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function QuizPage() {
  const router = useRouter();
  const [emailExists, setEmailExists] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { rgpdConsent: false },
  });

  const emailValue = watch('email');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!EMAIL_REGEX.test(emailValue ?? '')) {
      setEmailExists(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/check-email?email=${encodeURIComponent((emailValue ?? '').toLowerCase().trim())}`
        );
        const data: { exists: boolean } = await res.json();
        setEmailExists(data.exists);
      } catch {
        setEmailExists(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [emailValue]);

  const onSubmit = (data: FormValues) => {
    sessionStorage.setItem(
      'quiz_identity',
      JSON.stringify({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        service: data.service?.trim() || null,
        training_format: data.trainingFormat,
      })
    );
    sessionStorage.setItem('training_format', data.trainingFormat);
    router.push('/quiz/questions');
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-[600px] rounded-2xl p-8"
        style={{ background: 'var(--background)', boxShadow: '0 2px 16px 0 rgba(26,32,61,0.08)' }}
      >
        <Link href="/" className="inline-block mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          ← Retour
        </Link>

        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
          Vos informations
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Elles nous permettent de vous contacter après le quiz et de constituer les groupes de formation.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Prénom */}
          <div className="space-y-1">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              aria-label="Prénom"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p id="firstName-error" role="alert" className="text-xs" style={{ color: '#EF4444' }}>
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Nom */}
          <div className="space-y-1">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              aria-label="Nom"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p id="lastName-error" role="alert" className="text-xs" style={{ color: '#EF4444' }}>
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email professionnel *</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-label="Email professionnel"
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? 'email-error' : emailExists ? 'email-warning' : undefined
              }
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs" style={{ color: '#EF4444' }}>
                {errors.email.message}
              </p>
            )}
            {!errors.email && emailExists && (
              <p id="email-warning" role="status" className="text-xs" style={{ color: '#F97316' }}>
                Un résultat existe déjà pour cet email. Si vous continuez, votre précédente passation sera remplacée.
              </p>
            )}
          </div>

          {/* Service */}
          <div className="space-y-1">
            <Label htmlFor="service">Service ou direction</Label>
            <Input
              id="service"
              maxLength={100}
              placeholder="Ex : Cardiologie, Pharmacie, RH, Direction des soins…"
              aria-label="Service ou direction"
              {...register('service')}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Optionnel — précisez votre service pour faciliter l&apos;organisation des groupes.
            </p>
          </div>

          {/* Format de formation préféré */}
          <div className="space-y-2">
            <Label>Format de formation préféré *</Label>
            <Controller
              control={control}
              name="trainingFormat"
              render={({ field }) => (
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2"
                  aria-invalid={!!errors.trainingFormat}
                  aria-describedby={errors.trainingFormat ? 'trainingFormat-error' : undefined}
                >
                  {[
                    { value: 'presentiel', label: 'Présentiel' },
                    { value: 'distanciel', label: 'Distanciel' },
                    { value: 'indifferent', label: 'Indifférent' },
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`format-${value}`} />
                      <Label htmlFor={`format-${value}`} className="font-normal cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Cela nous permettra d&apos;organiser les sessions selon vos disponibilités.
            </p>
            {errors.trainingFormat && (
              <p id="trainingFormat-error" role="alert" className="text-xs" style={{ color: '#EF4444' }}>
                {errors.trainingFormat.message}
              </p>
            )}
          </div>

          {/* Consentement RGPD */}
          <div className="flex items-start gap-3 pt-1">
            <Controller
              control={control}
              name="rgpdConsent"
              render={({ field }) => (
                <Checkbox
                  id="rgpdConsent"
                  aria-label="Consentement RGPD"
                  aria-invalid={!!errors.rgpdConsent}
                  checked={field.value ?? false}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5 shrink-0"
                />
              )}
            />
            <div>
              <Label htmlFor="rgpdConsent" className="cursor-pointer leading-snug font-normal">
                J&apos;accepte que mes réponses soient utilisées dans le cadre de ce programme de
                formation, conformément au RGPD.
              </Label>
              {errors.rgpdConsent && (
                <p role="alert" className="text-xs mt-1" style={{ color: '#EF4444' }}>
                  {errors.rgpdConsent.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2 cursor-pointer"
            style={{ background: 'var(--primary)', color: '#fff' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Chargement…' : 'Démarrer le quiz →'}
          </Button>
        </form>
      </div>
    </div>
  );
}

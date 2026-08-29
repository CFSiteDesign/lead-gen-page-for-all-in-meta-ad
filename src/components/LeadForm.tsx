import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { submitLead } from "@/lib/leads";
import { ALL_NATIONALITIES, POPULAR_NATIONALITIES } from "@/data/nationalities";
import { Starburst } from "@/components/Sticker";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name")
    .max(80, "That name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "We need an email to send the guide")
    .email("That email doesn't look right"),
  phone: z
    .string()
    .trim()
    .min(6, "Add a contactable number")
    .max(25, "That number is too long")
    .regex(/^[+()\d\s-]+$/, "Numbers, spaces and + only"),
  nationality: z.string().min(1, "Pick your nationality"),
});

/**
 * Declared by hand rather than via `z.infer`: this scaffold runs with
 * `strict: false`, under which zod infers every field as optional and the
 * payload no longer satisfies `LeadInput`. The shape is asserted against the
 * schema below, so the two cannot drift silently.
 */
interface FormValues {
  name: string;
  email: string;
  phone: string;
  nationality: string;
}

// Compile-time guard: fails the build if `schema` and `FormValues` diverge.
type SchemaKeys = keyof z.infer<typeof schema>;
type _KeysMatch = [SchemaKeys] extends [keyof FormValues]
  ? [keyof FormValues] extends [SchemaKeys]
    ? true
    : never
  : never;
const _keysMatch: _KeysMatch = true;

/** Nationalities that already appear in the "popular" group, so we don't repeat them A–Z. */
const POPULAR = new Set<string>(POPULAR_NATIONALITIES);
const REST = ALL_NATIONALITIES.filter((n) => !POPULAR.has(n));

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 font-sticker text-[10px] tracking-[0.1em] text-mm-pink">
      {message}
    </p>
  );
}

const LABEL = "mb-1.5 block font-sticker text-[10px] tracking-[0.16em] text-mm-black/70";

export function LeadForm({ id = "get-the-guide" }: { id?: string }) {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: "", email: "", phone: "", nationality: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await submitLead(values);
      setDone(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? "Something went wrong sending that. Give it another go."
          : "Something went wrong sending that. Give it another go.",
      );
    }
  };

  if (done) {
    return (
      <div
        id={id}
        className="animate-pop-in border-[4px] border-mm-black bg-mm-lime p-7 text-mm-black shadow-mm-lg md:p-9"
      >
        <div className="flex flex-col items-center text-center">
          <Starburst size={116} color="yellow" rotate={-8} textClassName="text-[13px]">
            YOU'RE
            <br />
            IN
          </Starburst>
          <h3 className="mt-6 font-display text-[2rem] leading-[0.95] md:text-[2.5rem]">
            CHECK YOUR
            <br />
            INBOX.
          </h3>
          <p className="mt-4 max-w-sm text-sm font-semibold leading-snug text-mm-black/80">
            The ALL IN trip guide is on its way — routes, dates, what's included and what it costs.
            If it's not there in a few minutes, check your spam folder.
          </p>
          <p className="mt-6 font-sticker text-[10px] tracking-[0.18em] text-mm-black/60">
            NOW GO TELL THE GROUP CHAT.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className="border-[4px] border-mm-black bg-mm-bone p-6 text-mm-black shadow-mm-lg md:p-8"
    >
      <h2 className="font-display text-[1.75rem] leading-[0.95] md:text-[2.15rem]">
        GET THE FREE
        <br />
        <span className="bg-mm-orange px-1.5">TRIP GUIDE.</span>
      </h2>
      <p className="mt-3 text-sm font-semibold leading-snug text-mm-black/70">
        Every route, every date, everything that's included — straight to your inbox. Takes 20 seconds.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={LABEL}>
            FIRST + LAST NAME
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Taylor"
            aria-invalid={!!errors.name}
            className="mm-field"
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor="email" className={LABEL}>
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            aria-invalid={!!errors.email}
            className="mm-field"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="phone" className={LABEL}>
            PHONE (INCLUDE COUNTRY CODE)
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+61 400 000 000"
            aria-invalid={!!errors.phone}
            className="mm-field"
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <label htmlFor="nationality" className={LABEL}>
            NATIONALITY
          </label>
          <select
            id="nationality"
            autoComplete="country-name"
            aria-invalid={!!errors.nationality}
            defaultValue=""
            className="mm-field mm-select"
            {...register("nationality")}
          >
            <option value="" disabled>
              Select your nationality
            </option>
            <optgroup label="Most common">
              {POPULAR_NATIONALITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </optgroup>
            <optgroup label="All nationalities">
              {REST.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </optgroup>
          </select>
          <FieldError message={errors.nationality?.message} />
        </div>

        {submitError && (
          <p role="alert" className="border-[3px] border-mm-black bg-mm-pink px-3 py-2 font-sticker text-[10px] tracking-[0.12em] text-mm-black">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex w-full items-center justify-center gap-2 border-[3px] border-mm-black bg-mm-lime px-6 py-4 font-display text-base text-mm-black shadow-mm transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              SENDING…
            </>
          ) : (
            <>
              SEND ME THE GUIDE
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <p className="flex items-start gap-1.5 text-[11px] font-semibold leading-snug text-mm-black/55">
          <Check className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          No spam. Just trip info and the odd deal. Unsubscribe whenever.
        </p>
      </form>
    </div>
  );
}

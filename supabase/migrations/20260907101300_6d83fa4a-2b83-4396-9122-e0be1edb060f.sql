CREATE TABLE public.admin_security (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  password_hash text,
  session_version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_security TO service_role;
ALTER TABLE public.admin_security ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_login_attempts (
  fingerprint text PRIMARY KEY,
  failed_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_security (singleton) VALUES (true) ON CONFLICT (singleton) DO NOTHING;
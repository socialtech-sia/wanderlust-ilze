CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_country text,
  text_lv text,
  text_en text,
  text_es text,
  rating smallint NOT NULL DEFAULT 5,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY testimonials_public_read ON public.testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY testimonials_admin_all ON public.testimonials
  FOR ALL USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER testimonials_set_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PLACEHOLDER CONTENT: the three rows below are sample reviews so the
-- home page section renders. Replace them with real guest reviews.
INSERT INTO public.testimonials (author_name, author_country, rating, sort_order, text_lv, text_en, text_es) VALUES
('Marta B.', 'Latvija', 5, 1,
 'Gājām Gaujas krastu taku ar Ilzi rudens sākumā. Viņa zina, kur pagriezties nost no galvenās takas, un stāsti par ieleju bija tikpat interesanti kā skati.',
 'We walked the Gauja riverbank trail with Ilze in early autumn. She knows where to turn off the main path, and her stories about the valley were as good as the views.',
 'Recorrimos el sendero de la ribera del Gauja con Ilze a principios de otoño. Sabe dónde desviarse del camino principal, y sus relatos sobre el valle fueron tan buenos como las vistas.'),
('James R.', 'United Kingdom', 5, 2,
 'Ekskursija pa Siguldu un Turaidu bija skaidri saplānota, bez steigas. Ilze atbildēja uz e-pastu tajā pašā dienā un visu noorganizēja, ieskaitot transferu no Rīgas.',
 'The Sigulda and Turaida tour was clearly planned and never rushed. Ilze replied to my email the same day and arranged everything, including the transfer from Riga.',
 'La excursión por Sigulda y Turaida estuvo bien planificada y sin prisas. Ilze respondió a mi correo el mismo día y lo organizó todo, incluido el traslado desde Riga.'),
('Carmen L.', 'España', 5, 3,
 'Ceļojām ģimenē ar bērniem, un maršruts bija pielāgots mūsu tempam. Paldies par pacietību un par spāņu valodu — tas daudz atviegloja.',
 'We travelled as a family with children and the route was adapted to our pace. Thank you for the patience and for speaking Spanish — it made everything easier.',
 'Viajamos en familia con niños y la ruta se adaptó a nuestro ritmo. Gracias por la paciencia y por hablar español: lo hizo todo mucho más fácil.');
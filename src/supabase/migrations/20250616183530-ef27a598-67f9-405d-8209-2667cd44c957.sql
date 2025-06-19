
-- Crear tabla para almacenar las cartas de amor
CREATE TABLE public.love_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (por ahora permitimos acceso completo)
ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;

-- Crear política que permite a todos ver todas las cartas (ya que es solo para ustedes dos)
CREATE POLICY "Anyone can view love letters" 
  ON public.love_letters 
  FOR SELECT 
  USING (true);

-- Crear política que permite a todos crear cartas
CREATE POLICY "Anyone can create love letters" 
  ON public.love_letters 
  FOR INSERT 
  WITH CHECK (true);

-- Crear tabla para almacenar las playlists de música
CREATE TABLE public.music_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  spotify_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security para playlists
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;

-- Crear políticas para playlists
CREATE POLICY "Anyone can view playlists" 
  ON public.music_playlists 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create playlists" 
  ON public.music_playlists 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can delete playlists" 
  ON public.music_playlists 
  FOR DELETE 
  USING (true);

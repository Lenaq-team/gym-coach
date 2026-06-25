-- Seed: ejercicios base del catálogo de gym-coach
-- ~55 ejercicios con nombres en español, is_custom = FALSE, created_by = NULL
-- Idempotent: only runs if the exercises table is empty.

BEGIN;

INSERT INTO public.exercises
  (id, name, description, category, muscle_groups, equipment, difficulty_level, is_custom, created_by)
SELECT * FROM (VALUES

-- ============================================================
-- HOMBROS (14 rutina real + complementos)
-- ============================================================
(
  gen_random_uuid(),
  'Press de Platos Pronados',
  'Calentamiento de hombros sosteniendo un plato con agarre pronado y presionando hacia adelante al frente del cuerpo.',
  'strength',
  ARRAY['deltoides anterior', 'deltoides lateral', 'manguito rotador'],
  ARRAY['disco'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Press de Hombro con Kettlebell a Un Brazo',
  'Press de hombro unilateral con kettlebell de pie, trabajando estabilidad del core y fuerza del deltoides.',
  'strength',
  ARRAY['deltoides', 'tríceps', 'core'],
  ARRAY['kettlebell'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Molino con Kettlebell',
  'Movimiento de bisagra lateral con kettlebell elevado que trabaja movilidad de cadera, core y hombro.',
  'flexibility',
  ARRAY['core', 'oblicuos', 'deltoides', 'isquiotibiales'],
  ARRAY['kettlebell'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Vuelos Laterales con Mancuernas',
  'Elevaciones laterales de pie con mancuernas para aislar el deltoides lateral.',
  'strength',
  ARRAY['deltoides lateral'],
  ARRAY['mancuernas'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Pec Deck Invertido (Deltoides Posterior)',
  'Vuelos invertidos en máquina pec deck para trabajar el deltoides posterior y romboides.',
  'strength',
  ARRAY['deltoides posterior', 'romboides', 'trapecio medio'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Press de Hombro con Barra',
  'Press sobre la cabeza con barra desde posición de pie o sentado, movimiento compuesto de hombros.',
  'strength',
  ARRAY['deltoides', 'tríceps', 'trapecio'],
  ARRAY['barra'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Press Arnold',
  'Variante del press de hombros con mancuernas con rotación de muñecas para mayor rango de movimiento.',
  'strength',
  ARRAY['deltoides', 'tríceps'],
  ARRAY['mancuernas'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Elevación Frontal con Mancuernas',
  'Elevación de mancuernas al frente del cuerpo para trabajar el deltoides anterior.',
  'strength',
  ARRAY['deltoides anterior'],
  ARRAY['mancuernas'],
  'beginner',
  FALSE, NULL
),

-- ============================================================
-- BÍCEPS
-- ============================================================
(
  gen_random_uuid(),
  'Curl Martillo de Pie',
  'Curl de bíceps con agarre neutro (martillo) que trabaja tanto el bíceps como el braquial.',
  'strength',
  ARRAY['bíceps', 'braquial', 'braquiorradial'],
  ARRAY['mancuernas'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Curl de Bíceps con Barra',
  'Curl de bíceps clásico con barra recta o EZ para máximo desarrollo del bíceps.',
  'strength',
  ARRAY['bíceps', 'braquial'],
  ARRAY['barra'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Curl Concentrado',
  'Curl de bíceps con mancuerna sentado apoyando el codo en el muslo para aislar el bíceps.',
  'strength',
  ARRAY['bíceps'],
  ARRAY['mancuernas'],
  'beginner',
  FALSE, NULL
),

-- ============================================================
-- TRÍCEPS
-- ============================================================
(
  gen_random_uuid(),
  'Dips en Paralelas',
  'Fondos en barras paralelas que trabajan pecho inferior y tríceps con peso corporal.',
  'strength',
  ARRAY['tríceps', 'pectoral inferior', 'deltoides anterior'],
  ARRAY['peso corporal', 'paralelas'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Extensión de Tríceps en Polea',
  'Pushdown de tríceps en polea alta con barra recta o cuerda para aislar el tríceps.',
  'strength',
  ARRAY['tríceps'],
  ARRAY['cable'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Rompecráneos con Barra EZ',
  'Extensión de tríceps tumbado con barra EZ, excelente para masa del tríceps.',
  'strength',
  ARRAY['tríceps'],
  ARRAY['barra', 'banco'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Press de Banca Agarre Cerrado',
  'Press de banca con agarre estrecho para enfatizar el trabajo de tríceps.',
  'strength',
  ARRAY['tríceps', 'pectoral', 'deltoides anterior'],
  ARRAY['barra', 'banco'],
  'intermediate',
  FALSE, NULL
),

-- ============================================================
-- PECHO
-- ============================================================
(
  gen_random_uuid(),
  'Press de Banca con Barra',
  'Ejercicio compuesto fundamental para el desarrollo del pecho con barra y banco plano.',
  'strength',
  ARRAY['pectoral mayor', 'tríceps', 'deltoides anterior'],
  ARRAY['barra', 'banco'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Press de Banca Inclinado',
  'Variante del press de banca con banco inclinado para enfatizar el pecho superior.',
  'strength',
  ARRAY['pectoral superior', 'tríceps', 'deltoides anterior'],
  ARRAY['barra', 'banco'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Aperturas con Mancuernas',
  'Aperturas en banco plano con mancuernas para estirar y contraer el pecho.',
  'strength',
  ARRAY['pectoral mayor'],
  ARRAY['mancuernas', 'banco'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Cruce de Poleas',
  'Ejercicio de aislamiento de pecho con cables para máxima contracción y congestión.',
  'strength',
  ARRAY['pectoral mayor'],
  ARRAY['cable'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Flexión de Brazos',
  'Push-up clásico con peso corporal, ejercicio fundamental de empuje.',
  'strength',
  ARRAY['pectoral', 'tríceps', 'deltoides anterior', 'core'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),

-- ============================================================
-- ESPALDA
-- ============================================================
(
  gen_random_uuid(),
  'Dominadas',
  'Ejercicio de jalón con peso corporal en barra fija, uno de los mejores para el dorsal.',
  'strength',
  ARRAY['dorsal ancho', 'bíceps', 'romboides'],
  ARRAY['peso corporal', 'barra fija'],
  'advanced',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Jalón al Pecho en Polea',
  'Jalón vertical en máquina de polea para desarrollar el dorsal ancho.',
  'strength',
  ARRAY['dorsal ancho', 'bíceps', 'romboides'],
  ARRAY['máquina', 'cable'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Remo Sentado en Cable',
  'Remo horizontal en polea baja para trabajar la espalda media y bíceps.',
  'strength',
  ARRAY['dorsal ancho', 'romboides', 'trapecio medio', 'bíceps'],
  ARRAY['cable'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Remo con Barra',
  'Remo inclinado con barra para desarrollar el grosor y espesor de la espalda.',
  'strength',
  ARRAY['dorsal ancho', 'romboides', 'trapecio', 'bíceps'],
  ARRAY['barra'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Remo con Mancuerna a Un Brazo',
  'Remo unilateral con mancuerna apoyado en banco, excelente para el dorsal.',
  'strength',
  ARRAY['dorsal ancho', 'romboides', 'bíceps'],
  ARRAY['mancuernas', 'banco'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Face Pull en Polea',
  'Jalón hacia la cara con cuerda en polea alta para deltoides posterior y manguito rotador.',
  'strength',
  ARRAY['deltoides posterior', 'romboides', 'manguito rotador', 'trapecio medio'],
  ARRAY['cable'],
  'beginner',
  FALSE, NULL
),

-- ============================================================
-- PIERNAS
-- ============================================================
(
  gen_random_uuid(),
  'Peso Muerto con Barra',
  'Movimiento de bisagra de cadera con barra, ejercicio compuesto para la cadena posterior.',
  'strength',
  ARRAY['isquiotibiales', 'glúteos', 'erectores espinales', 'trapecios'],
  ARRAY['barra'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Hip Thrust en Máquina',
  'Empuje de cadera en máquina dedicada para aislar y sobrecargar los glúteos.',
  'strength',
  ARRAY['glúteo mayor', 'isquiotibiales'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Flexión de Rodilla Sentado (Leg Curl)',
  'Curl de isquiotibiales en máquina sentado para aislar los músculos posteriores del muslo.',
  'strength',
  ARRAY['isquiotibiales'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Abducción de Cadera en Máquina',
  'Apertura de piernas en máquina de abducción para trabajar glúteo medio y tensor.',
  'strength',
  ARRAY['glúteo medio', 'glúteo menor', 'tensor de la fascia lata'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Pantorrilla en Máquina',
  'Elevación de talones en máquina de calf sentado o de pie para el desarrollo del gastrocnemio y sóleo.',
  'strength',
  ARRAY['gastrocnemio', 'sóleo'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Sentadilla con Barra',
  'La reina de los ejercicios de pierna, sentadilla con barra en la espalda.',
  'strength',
  ARRAY['cuádriceps', 'glúteos', 'isquiotibiales', 'core'],
  ARRAY['barra'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Prensa de Piernas',
  'Press de piernas en máquina de 45°, ejercicio compuesto para cuádriceps y glúteos.',
  'strength',
  ARRAY['cuádriceps', 'glúteos', 'isquiotibiales'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Peso Muerto Rumano',
  'Variante del peso muerto con énfasis en el estiramiento de isquiotibiales y glúteos.',
  'strength',
  ARRAY['isquiotibiales', 'glúteos', 'erectores espinales'],
  ARRAY['barra'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Zancadas Caminando',
  'Lunges caminando para trabajar cuádriceps, glúteos y mejorar el equilibrio.',
  'strength',
  ARRAY['cuádriceps', 'glúteos', 'isquiotibiales'],
  ARRAY['peso corporal', 'mancuernas'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Extensión de Piernas en Máquina',
  'Extensión de rodilla en máquina para aislar el cuádriceps.',
  'strength',
  ARRAY['cuádriceps'],
  ARRAY['máquina'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Elevación de Talones de Pie',
  'Elevación de talones con peso corporal o barra para trabajar el gastrocnemio.',
  'strength',
  ARRAY['gastrocnemio', 'sóleo'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Sentadilla Goblet',
  'Sentadilla con kettlebell o mancuerna sujetada frente al pecho, ideal para principiantes.',
  'strength',
  ARRAY['cuádriceps', 'glúteos', 'core'],
  ARRAY['kettlebell', 'mancuernas'],
  'beginner',
  FALSE, NULL
),

-- ============================================================
-- CORE / ABDOMEN
-- ============================================================
(
  gen_random_uuid(),
  'Plancha',
  'Ejercicio isométrico de core sosteniendo la posición de planche sobre los codos.',
  'strength',
  ARRAY['core', 'transverso abdominal', 'oblicuos'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Plancha Lateral',
  'Variante de la plancha en posición lateral para trabajar oblicuos y estabilizadores.',
  'strength',
  ARRAY['oblicuos', 'cuadrado lumbar', 'core'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Giro Ruso',
  'Rotación del tronco con o sin peso, sentado en el suelo, para trabajar los oblicuos.',
  'strength',
  ARRAY['oblicuos', 'recto abdominal'],
  ARRAY['peso corporal', 'disco', 'mancuernas'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Elevación de Piernas Colgado',
  'Elevación de piernas en barra fija para trabajar el recto abdominal inferior y flexores de cadera.',
  'strength',
  ARRAY['recto abdominal', 'flexores de cadera', 'oblicuos'],
  ARRAY['peso corporal', 'barra fija'],
  'intermediate',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Rueda Abdominal',
  'Rodamiento hacia adelante con rueda abdominal, ejercicio avanzado para el core completo.',
  'strength',
  ARRAY['recto abdominal', 'oblicuos', 'serrato', 'dorsales'],
  ARRAY['rueda abdominal'],
  'advanced',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Crunch Abdominal en Cable',
  'Crunch con polea alta para resistencia constante en el recto abdominal.',
  'strength',
  ARRAY['recto abdominal'],
  ARRAY['cable'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Escaladores (Mountain Climbers)',
  'Ejercicio dinámico de core en posición de plancha alternando el empuje de rodillas al pecho.',
  'cardio',
  ARRAY['core', 'flexores de cadera', 'hombros'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),

-- ============================================================
-- CARDIO
-- ============================================================
(
  gen_random_uuid(),
  'Escaladora (Stair Climber)',
  'Cardio en máquina escaladora que simula subir escalones, excelente para glúteos y piernas.',
  'cardio',
  ARRAY['glúteos', 'cuádriceps', 'isquiotibiales', 'cardiorrespiratorio'],
  ARRAY['cardio'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Caminata Inclinada (Incline Walk)',
  'Caminata en cinta a alta inclinación y velocidad moderada para quema de grasa y cardio.',
  'cardio',
  ARRAY['glúteos', 'isquiotibiales', 'cardiorrespiratorio'],
  ARRAY['cardio'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Carrera en Cinta',
  'Correr en cinta a ritmo constante o con intervalos para mejorar la capacidad cardiovascular.',
  'cardio',
  ARRAY['cardiorrespiratorio', 'cuádriceps', 'isquiotibiales', 'gemelos'],
  ARRAY['cardio'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Bicicleta Estática',
  'Pedaleo en bicicleta estática de bajo impacto articular y alto rendimiento cardiovascular.',
  'cardio',
  ARRAY['cardiorrespiratorio', 'cuádriceps', 'isquiotibiales'],
  ARRAY['cardio'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Remo en Máquina (Rowing Machine)',
  'Cardio en ergómetro de remo que trabaja cuerpo completo: piernas, core y espalda.',
  'cardio',
  ARRAY['cardiorrespiratorio', 'dorsales', 'bíceps', 'piernas', 'core'],
  ARRAY['cardio'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Saltar la Cuerda',
  'Cardio de alta intensidad con cuerda de saltar para coordinación y resistencia.',
  'cardio',
  ARRAY['cardiorrespiratorio', 'gemelos', 'hombros'],
  ARRAY['cuerda'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Battle Ropes',
  'Ondulaciones con cuerdas pesadas para cardio de alta intensidad y fuerza de brazos.',
  'cardio',
  ARRAY['cardiorrespiratorio', 'hombros', 'core', 'brazos'],
  ARRAY['cuerdas de batalla'],
  'intermediate',
  FALSE, NULL
),

-- ============================================================
-- FLEXIBILIDAD / MOVILIDAD
-- ============================================================
(
  gen_random_uuid(),
  'Estiramiento de Flexores de Cadera',
  'Posición de zancada baja estática para estirar el psoas ilíaco y los flexores de cadera.',
  'flexibility',
  ARRAY['psoas', 'ilíaco', 'cuádriceps'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Rotación Torácica',
  'Ejercicio de movilidad para la columna torácica, mejora la rotación y postura.',
  'flexibility',
  ARRAY['columna torácica', 'oblicuos'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'Gato-Vaca (Cat-Cow)',
  'Ejercicio de movilidad espinal en cuadrupedia alternando flexión y extensión de columna.',
  'flexibility',
  ARRAY['columna vertebral', 'core', 'erectores espinales'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
),
(
  gen_random_uuid(),
  'El Mejor Estiramiento del Mundo (World''s Greatest Stretch)',
  'Estiramiento compuesto que trabaja cadera, columna torácica y cadena posterior en una sola secuencia.',
  'flexibility',
  ARRAY['cadena posterior', 'flexores de cadera', 'columna torácica', 'aductores'],
  ARRAY['peso corporal'],
  'beginner',
  FALSE, NULL
) AS v(id, name, description, category, muscle_groups, equipment, difficulty_level, is_custom, created_by)
WHERE NOT EXISTS (SELECT 1 FROM public.exercises LIMIT 1);

COMMIT;

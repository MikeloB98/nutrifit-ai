# NutriFit AI — Guia de Usuario

## ¿Que es NutriFit AI?

NutriFit AI es tu coach nutricional con inteligencia artificial. Dile por voz lo que has comido y entrenado hoy, y recibe al instante:

- Un **analisis nutricional completo** de todo lo que has comido (calorias, proteinas, carbohidratos, grasas).
- Un **analisis de tu entrenamiento** con calorias quemadas y volumen de trabajo.
- **Graficos visuales** de tu distribucion de macros y balance calorico.
- **Recomendaciones personalizadas** de un experto en nutricion deportiva.

No necesitas buscar cada alimento en una base de datos ni calcular nada manualmente. Solo habla.

---

## Pantalla por Pantalla

### Pantalla: Inicio (Home)

`[screenshot: pantalla principal con fondo oscuro, titulo "NutriFit AI" en grande con "Fit" en verde lima, boton circular de microfono verde en el centro, y campo de texto debajo]`

Esta es la pantalla principal. Veras:
- El **titulo** "NutriFit AI" en la parte superior.
- Un **boton grande de microfono** verde en el centro.
- Un **area de texto** donde aparece tu transcripcion (y donde puedes escribir directamente).
- Botones de **"Limpiar"** y **"Analizar mi dia"**.

#### Como usarla:

1. **Pulsa el boton de microfono** (se pondra rojo mientras escucha).
2. **Habla de forma natural**, como si le contaras a un amigo lo que has comido y entrenado. Por ejemplo:
   > "He desayunado tostadas con aguacate y dos huevos. Para comer, una pechuga a la plancha con arroz. De entreno he hecho espalda: dominadas 4 series de 8 y remo con barra 4 series de 10 a 60 kilos."
3. **Pulsa de nuevo el microfono** para parar la grabacion.
4. **Revisa la transcripcion** en el area de texto. Puedes editarla si algo se transcribio mal.
5. **Pulsa "Analizar mi dia"** y espera mientras los agentes procesan tu informacion.

Veras un indicador de progreso con 5 pasos que te dice exactamente que esta haciendo el sistema.

#### Boton de Perfil

En la esquina superior derecha hay un boton **"Perfil"**. Pulsalo para introducir tus datos (peso, altura, edad, etc.) y que los calculos sean mas precisos.

---

### Pantalla: Resultados (Dashboard)

`[screenshot: dashboard con fondo oscuro mostrando tres tarjetas en fila (grafico de macros circular, barra de balance calorico, gauge de calidad), debajo dos tablas (nutricion y entrenamiento), y al final tres cards de colores con consejos del experto]`

Aqui ves todo el analisis de tu dia. Las secciones son:

#### Graficos visuales (fila superior)

- **Distribucion de Macros**: Un grafico circular que muestra como se reparten tus macronutrientes (proteinas en azul, carbohidratos en amarillo, grasas en rojo). Incluye gramos y porcentaje de cada uno.

- **Balance Calorico**: Dos barras que comparan lo que has ingerido vs. lo que has quemado en el entrenamiento. Abajo aparece el **balance neto** (positivo = superavit, negativo = deficit).

- **Calidad Nutricional**: Un medidor de 0 a 100 que evalua la calidad general de tu alimentacion del dia (variedad, fibra, micronutrientes, etc.).

#### Tabla de Comidas

`[screenshot: tabla con columnas Alimento, Porcion, Calorias, Proteina, Carbos, Grasa, con filas para cada comida y una fila de total resaltada en verde]`

Aqui ves cada cosa que has comido con sus valores nutricionales. Si un plato es una receta compuesta (como "arroz con pollo"), veras los ingredientes individuales debajo del nombre. La ultima fila muestra el **total del dia**.

#### Tabla de Entrenamiento

`[screenshot: tabla con columnas Ejercicio, Tipo, Duracion, Volumen, Intensidad, Calorias]`

Cada ejercicio que has hecho con las calorias quemadas estimadas, el volumen total de trabajo (para fuerza) y la intensidad. La ultima fila muestra el **total de calorias quemadas**.

#### Consejos del Experto

Tres tarjetas con codigo de colores:

- **Verde — "Lo que haces bien"**: Habitos positivos que estas manteniendo. El sistema reconoce tu esfuerzo con datos concretos.

- **Amarilla — "Puedes mejorar"**: Areas donde hay margen de mejora, con explicacion de por que es importante.

- **Azul — "Recomendaciones"**: Acciones concretas y especificas para el dia siguiente. No consejos genericos, sino cosas que puedes hacer ya.

Ademas veras:
- Una **nota global** (A+, B, C, etc.) que resume tu dia.
- Un **banner con la accion prioritaria** — lo mas importante que deberias hacer mañana.
- Una **nota motivacional** personalizada.

---

### Pantalla: Perfil

`[screenshot: modal con fondo oscuro semi-transparente, formulario con campos de peso, altura, edad, sexo, nivel de actividad y objetivo, y botones Cancelar/Guardar]`

Rellena tus datos para que los calculos sean mas precisos:

- **Peso (kg)**: Tu peso actual.
- **Altura (cm)**: Tu altura.
- **Edad**: Tu edad en años.
- **Sexo**: Masculino o Femenino.
- **Nivel de actividad**: Desde Sedentario hasta Muy activo.
- **Objetivo**: Recomposicion corporal, Ganar musculo o Perder grasa.

Los datos se guardan en tu navegador (localStorage), asi que no necesitas rellenarlos cada vez.

---

## Ejemplos de Uso

### Ejemplo 1 — Dia de fuerza

> "He comido tortilla de patatas y un cafe con leche. De entreno: sentadillas 5x5 a 100kg, prensa 4x12 a 180kg, extensiones de cuadriceps 3x15 a 40kg."

**Resultado esperado:**
- ~1200 kcal ingeridas
- Alto volumen de pierna (~15000 kg volumen total)
- Recomendacion de aumentar proteina post-entreno y añadir mas comidas para cubrir el deficit

### Ejemplo 2 — Dia de cardio y dieta

> "Desayuno: yogur griego con frutos rojos. Comida: ensalada de atun con tomate y maiz. Cena: sopa de verduras. Entreno: 45 minutos de carrera a 8km/h."

**Resultado esperado:**
- ~1100 kcal ingeridas
- ~400 kcal quemadas
- Deficit calorico agresivo detectado
- Recomendacion de subir calorias para no perder musculo, especialmente proteina

### Ejemplo 3 — Dia trampa

> "He comido una hamburguesa doble con patatas fritas y un refresco. De cena, pizza margarita. No he entrenado."

**Resultado esperado:**
- ~2800 kcal ingeridas
- 0 kcal quemadas en ejercicio
- Nota baja (C o D)
- Consejo de no compensar al dia siguiente sino volver a la rutina normal
- Recomendacion de hacer una sesion de entreno de fuerza al dia siguiente

---

## Preguntas Frecuentes

**¿Funciona en el movil?**
Si. El microfono funciona en Chrome para Android. En iOS, el soporte de Web Speech API es limitado — usa el campo de texto como alternativa.

**¿Puedo escribir en vez de hablar?**
Si. El area de texto bajo el microfono permite escribir directamente. No necesitas usar la voz si prefieres teclear.

**¿Los datos se guardan?**
Tu perfil (peso, altura, etc.) se guarda en el navegador (localStorage). Los analisis no se guardan entre sesiones — cada vez que cierras la app, los resultados se pierden. Si quieres guardar un analisis, haz una captura de pantalla.

**¿Que hago si no me reconoce bien la voz?**
- Habla claro, en un lugar sin ruido de fondo.
- Usa frases simples y directas.
- Puedes editar la transcripcion antes de pulsar "Analizar".
- Prueba con Chrome en escritorio para mejor reconocimiento.

**¿Cuanto tarda el analisis?**
Normalmente entre 30 y 60 segundos. Los agentes buscan informacion nutricional en internet en tiempo real, lo que puede variar segun la conexion.

**¿Los datos nutricionales son exactos?**
Los datos provienen de busquedas en internet en fuentes como USDA, BEDCA y MyFitnessPal. Son estimaciones razonables pero no sustituyen a un nutricionista profesional para diagnosticos medicos.

**¿Que navegadores son compatibles?**
- **Chrome** (recomendado): Soporte completo de voz y todas las funcionalidades.
- **Edge**: Soporte completo.
- **Firefox**: Funciona sin reconocimiento de voz (usa el campo de texto).
- **Safari**: Funcionalidad limitada.

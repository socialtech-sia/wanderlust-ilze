-- Контент, разошедшийся между supabase/migrations и рабочей базой Lovable.
--
-- Сид-миграция 20260727120431 написана с ON CONFLICT DO NOTHING. На Lovable
-- строки уже существовали, поэтому её вставки там не сработали ни разу:
-- в рабочей базе осталось то, что правили руками через админку, а чистый
-- накат миграций даёт исходный, более ранний вариант. Ни один из двух
-- вариантов не «победил» сам собой — расхождение надо было разрешать явно.
--
-- Решение: источник истины — рабочая база Lovable, то есть то, что сегодня
-- реально отдаёт wanderlust.lv. Так переключение домена ничего не меняет для
-- посетителя: те же тексты, те же контакты, те же URL.
--
-- Исключение — meta_title_lv/en/es у услуг: в Lovable они NULL, а в миграциях
-- заполнены. Их оставляем из миграций, терять заполненный тег title незачем.
--
-- Снято с https://uqddhtimdrwlzpbezbgi.supabase.co 2026-09-16, до удаления
-- проекта. Дальше источник истины — этот каталог.

-- ── services ───────────────────────────────────────────────────────────

update public.services set
  slug_en = $wl$gauja-national-park$wl$,
  slug_es = $wl$parque-nacional-gauja$wl$,
  title_en = $wl$Gauja National Park — nature beauty and history$wl$,
  title_es = $wl$Parque Nacional Gauja: naturaleza e historia$wl$,
  short_description_lv = $wl$Pilna diena Latvijas vecākajā nacionālajā parkā — no smilšakmens iežiem līdz pilsdrupām.$wl$,
  short_description_en = $wl$A full day in Latvia's oldest national park — from sandstone cliffs to castle ruins.$wl$,
  short_description_es = $wl$Día completo en el parque nacional más antiguo de Letonia: acantilados de arenisca y ruinas de castillos.$wl$,
  description_lv = $wl$Gaujas Nacionālais parks ir Latvijas vecākais un lielākais nacionālais parks — gandrīz simts kilometru senlejas, kur upe miljonu gadu laikā ir izgrauzusi ceļu cauri sarkanajam smilšakmenim. Šī ir pilnas dienas ekskursija, kurā izejam cauri parka svarīgākajām vietām un saprotam, kāpēc tieši šo apvidu sauc par Latvijas Šveici.

Sākam ar skatu punktiem pār senleju, kur labi redzama upes līkumu ģeogrāfija. Tālāk dodamies pie smilšakmens atsegumiem un alām — Gūtmaņala, lielākā Baltijā, ar avotu, kas nekad neaizsalst. Pēcpusdienā apskatām vienu no parka pilsdrupām un pastaigājam pa mežu takām, kur aug reti augi un ligzdo melnie stārķi.

Maršruts pielāgojams Jūsu tempam un interesēm — ja vairāk saista daba, veltām laiku takām; ja vēsture, ilgāk uzkavējamies pie pilīm un muzejiem.$wl$,
  description_en = $wl$Gauja National Park is Latvia''s oldest and largest national park — nearly a hundred kilometres of ancient valley where the river has carved its way through red sandstone over a million years. This is a full-day excursion covering the park''s most important sites and explaining why this region is called the Switzerland of Latvia.

We start at viewpoints over the valley, where the geography of the river bends is clearly visible. Then we visit the sandstone outcrops and caves — Gūtmaņala, the largest in the Baltics, with a spring that never freezes. In the afternoon we see one of the park''s castle ruins and walk forest trails where rare plants grow and black storks nest.

The route adapts to your pace and interests — more time on the trails if nature draws you, longer at the castles and museums if history does.$wl$,
  description_es = $wl$El Parque Nacional de Gauja es el más antiguo y extenso de Letonia — casi cien kilómetros de valle antiguo donde el río ha excavado su camino a través de la arenisca roja durante un millón de años. Esta es una excursión de día completo por los lugares más importantes del parque, y explica por qué esta región se llama la Suiza letona.

Empezamos en los miradores sobre el valle, donde se aprecia con claridad la geografía de los meandros. Luego visitamos los afloramientos de arenisca y las cuevas — Gūtmaņala, la mayor del Báltico, con un manantial que nunca se congela. Por la tarde vemos unas ruinas del castillo del parque y recorremos senderos forestales donde crecen plantas raras y anidan cigüeñas negras.

La ruta se adapta a su ritmo e intereses.$wl$,
  max_persons = 6,
  min_persons = 1,
  location_name = $wl$Gaujas NP$wl$,
  location_lat = 57.2,
  location_lng = 24.95,
  meta_description_lv = $wl$Pilnas dienas ekskursija Gaujas Nacionālajā parkā ar sertificētu gidi — senleja, smilšakmens alas, pilsdrupas un meža takas. 6 stundas, no 65 EUR.$wl$,
  meta_description_en = $wl$Full-day guided excursion in Gauja National Park — ancient valley, sandstone caves, castle ruins and forest trails. 6 hours, from EUR 65.$wl$,
  meta_description_es = $wl$Excursión de día completo en el Parque Nacional de Gauja con guía certificada — valle antiguo, cuevas de arenisca y ruinas. 6 horas, desde 65 EUR.$wl$
where slug_lv = $wl$gaujas-nacionalais-parks$wl$;

update public.services set
  slug_en = $wl$araisi-lake-fortress$wl$,
  slug_es = $wl$fortaleza-lacustre-araisi$wl$,
  title_en = $wl$Āraiši lake fortress and archaeological park$wl$,
  title_es = $wl$Fortaleza lacustre y parque arqueológico de Āraiši$wl$,
  short_description_lv = $wl$Rekonstruēta 9. gs. latgaļu ezerpils uz salas — vienīgā tāda Baltijā.$wl$,
  short_description_en = $wl$A reconstructed 9th-century Latgalian lake fortress on an island — unique in the Baltics.$wl$,
  short_description_es = $wl$Fortaleza lacustre latgaliana del siglo IX reconstruida en una isla, única en el Báltico.$wl$,
  description_lv = $wl$Āraišu ezerpils ir viena no retajām vietām Eiropā, kur latgaļu 9.–10. gadsimta apmetne ir atjaunota tieši tur, kur tā stāvēja — uz saliņas ezerā, koka platformās virs ūdens. Arheologi to izraka gandrīz trīsdesmit gadus, un rekonstrukcija balstās uz to, kas patiešām tika atrasts.

Ekskursijā izstaigājam ezerpili un runājam par to, kā cilvēki šeit dzīvoja pirms tūkstoš gadiem — kā būvēja mājas bez naglām, ko ēda, kā aizsargājās. Blakus atrodas arheoloģiskais parks ar akmens un bronzas laikmeta mājokļu rekonstrukcijām, tāpēc vienā vietā var redzēt vairāku tūkstošu gadu attīstību.

Noslēgumā apskatām Āraišu vējdzirnavas un baznīcu. Maršruts labi der ģimenēm — bērniem ezerpils parasti paliek atmiņā ilgāk nekā jebkurš muzejs.$wl$,
  description_en = $wl$Āraiši Lake Fortress is one of the few places in Europe where a 9th–10th century Latgalian settlement has been rebuilt exactly where it stood — on an island in the lake, on wooden platforms above the water. Archaeologists excavated it for almost thirty years, and the reconstruction is based on what was actually found.

We walk through the fortress and talk about how people lived here a thousand years ago — how they built houses without nails, what they ate, how they defended themselves. Next to it lies an archaeological park with reconstructed Stone and Bronze Age dwellings, so several thousand years of development are visible in one place.

We finish at the Āraiši windmill and church. The route works well for families — children usually remember the lake fortress longer than any museum.$wl$,
  description_es = $wl$La fortaleza lacustre de Āraiši es uno de los pocos lugares de Europa donde un asentamiento latgaliano de los siglos IX–X ha sido reconstruido exactamente donde estaba — en una isla del lago, sobre plataformas de madera. Los arqueólogos la excavaron durante casi treinta años, y la reconstrucción se basa en lo que realmente se encontró.

Recorremos la fortaleza y hablamos de cómo vivía la gente aquí hace mil años: cómo construían casas sin clavos, qué comían, cómo se defendían. Al lado hay un parque arqueológico con viviendas reconstruidas de la Edad de Piedra y del Bronce.

Terminamos en el molino y la iglesia de Āraiši. La ruta funciona bien para familias.$wl$,
  min_persons = 1,
  location_lat = 57.2472,
  location_lng = 25.2758,
  meta_description_lv = $wl$Ekskursija uz Āraišu ezerpili un arheoloģisko parku — latgaļu apmetne uz ezera saliņas, akmens un bronzas laikmeta mājokļi. 4 stundas, no 40 EUR.$wl$,
  meta_description_en = $wl$Guided tour of Āraiši Lake Fortress and archaeological park — a Latgalian island settlement and Stone Age dwellings. 4 hours, from EUR 40.$wl$,
  meta_description_es = $wl$Visita guiada a la fortaleza lacustre de Āraiši y su parque arqueológico — asentamiento latgaliano en una isla. 4 horas, desde 40 EUR.$wl$
where slug_lv = $wl$araisu-ezerpils$wl$;

update public.services set
  slug_en = $wl$family-hike-turaida$wl$,
  slug_es = $wl$caminata-familiar-turaida$wl$,
  title_en = $wl$Family hike around Turaida$wl$,
  title_es = $wl$Caminata familiar por Turaida$wl$,
  short_description_lv = $wl$Viegls 3 stundu pārgājiens ar bērniem, piemērots visai ģimenei.$wl$,
  short_description_en = $wl$A gentle 3-hour hike suitable for the whole family.$wl$,
  short_description_es = $wl$Caminata suave de 3 horas apta para toda la familia.$wl$,
  description_lv = $wl$Trīs stundu pārgājiens, kas domāts ģimenēm ar bērniem — takas ir platas un labi ejamas, kāpumi nelieli, un visu ceļu ir ko skatīties. Sākam pie Turaidas un ejam pa Gaujas senlejas malu, kur starp priedēm paveras skats uz upi.

Ceļā apstājamies pie smilšakmens klintīm un avotiem. Bērniem stāstu par to, kā radās šīs sarkanās sienas un kāpēc smiltis birst, kad tām pieskaras — parasti tas ir vakara sarunu temats mājās. Ir vietas, kur var uzkāpt uz akmeņiem un paskatīties lejup uz upi, un vietas, kur mežā var meklēt dzeņu kaltos caurumus.

Tempu nosaka bērni. Pusceļā ieturam pauzi ar līdzpaņemtām uzkodām. Ja laiks ir silts, maršrutu var pagarināt līdz vietai, kur var pieiet pie ūdens.$wl$,
  description_en = $wl$A three-hour walk designed for families with children — the trails are wide and easy, the climbs gentle, and there is something to look at the whole way. We start near Turaida and follow the edge of the Gauja valley, where the river appears between the pines.

Along the way we stop at sandstone cliffs and springs. I explain to the children how these red walls formed and why the sand crumbles when you touch it — that usually becomes the evening conversation at home. There are places to climb onto rocks and look down at the river, and places in the forest to hunt for woodpecker holes.

The children set the pace. We pause halfway for snacks you bring along. In warm weather the route can be extended to a spot where you can reach the water.$wl$,
  description_es = $wl$Una caminata de tres horas pensada para familias con niños — los senderos son anchos y fáciles, las subidas suaves, y hay algo que mirar todo el camino. Empezamos cerca de Turaida y seguimos el borde del valle del Gauja, donde el río aparece entre los pinos.

Por el camino paramos en acantilados de arenisca y manantiales. Explico a los niños cómo se formaron estas paredes rojas y por qué la arena se desmorona al tocarla. Hay lugares para subir a las rocas y mirar el río, y zonas del bosque donde buscar agujeros de pájaro carpintero.

Los niños marcan el ritmo. A mitad de camino hacemos una pausa para merendar.$wl$,
  max_persons = 12,
  location_lat = 57.1858,
  location_lng = 24.8497,
  meta_description_lv = $wl$Viegls ģimenes pārgājiens Turaidas apkaimē ar gidi — platas takas, smilšakmens klintis un skats uz Gauju. 3 stundas, no 25 EUR.$wl$,
  meta_description_en = $wl$Easy family hike near Turaida with a guide — wide trails, sandstone cliffs and views over the Gauja. 3 hours, from EUR 25.$wl$,
  meta_description_es = $wl$Caminata familiar fácil cerca de Turaida con guía — senderos anchos, acantilados de arenisca y vistas del Gauja. 3 horas, desde 25 EUR.$wl$,
  sort_order = 10
where slug_lv = $wl$gimenes-pargajiens-turaida$wl$;

update public.services set
  slug_en = $wl$ligatne-nature-trails$wl$,
  slug_es = $wl$senderos-naturales-ligatne$wl$,
  title_en = $wl$Līgatne nature trails — full day$wl$,
  title_es = $wl$Senderos de Līgatne: día completo$wl$,
  short_description_lv = $wl$Pilna diena Līgatnes dabas parkā ar meža dzīvniekiem un smilšakmens klintīm.$wl$,
  short_description_en = $wl$A full day in Līgatne Nature Park with wildlife and sandstone cliffs.$wl$,
  short_description_es = $wl$Día completo en el parque natural de Līgatne con fauna y arenisca.$wl$,
  description_lv = $wl$Pilna diena Līgatnes dabas takās un apkārtnē — sešas stundas, kurās izejam gan mežu, gan senlejas nogāzes. Līgatne ir vieta, kur daba un rūpniecības vēsture ir cieši savijušās: te ir gan savvaļas dzīvnieku takas, gan vecais papīrfabrikas ciemats ar smilšakmenī izraktajiem pagrabiem.

Pirmajā daļā ejam pa dabas takām, kur mītnēs var redzēt Latvijas mežu iemītniekus — aļņus, staltbriežus, lūšus, lāčus. Tas nav zoodārzs: dzīvnieki ir plašos aplokos, un dažreiz tos jāpagaida. Pēc tam dodamies uz senlejas nogāzēm, kur takas ved cauri vecam mežam līdz skatu vietām pār upi.

Pēcpusdienā izstaigājam pašu Līgatnes ciematu — koka mājas, kas celtas fabrikas strādniekiem, un alu pagrabus, kuros joprojām glabājas kartupeļi un konservi. Diena ir garāka, tāpēc der ērti apavi un pusdienas somā.$wl$,
  description_en = $wl$A full day on the Līgatne nature trails and around them — six hours covering both forest and valley slopes. Līgatne is a place where nature and industrial history are tightly woven together: there are wildlife trails here, and an old paper-mill village with cellars dug into sandstone.

In the first half we walk the nature trails, where you can see the inhabitants of Latvian forests — elk, red deer, lynx, bears. This is not a zoo: the animals are in large enclosures and sometimes you have to wait for them. Then we head to the valley slopes, where paths lead through old forest to viewpoints over the river.

In the afternoon we walk through Līgatne village itself — the wooden houses built for mill workers, and the cave cellars where potatoes and preserves are still kept. It is a longer day, so bring comfortable shoes and lunch.$wl$,
  description_es = $wl$Un día completo en los senderos naturales de Līgatne — seis horas por bosque y laderas del valle. Līgatne es un lugar donde la naturaleza y la historia industrial están entrelazadas: hay senderos de fauna salvaje y un viejo pueblo papelero con bodegas excavadas en la arenisca.

En la primera parte recorremos los senderos naturales, donde se pueden ver los habitantes de los bosques letones — alces, ciervos, linces, osos. No es un zoológico: los animales están en grandes recintos y a veces hay que esperarlos. Luego vamos a las laderas del valle, con miradores sobre el río.

Por la tarde recorremos el pueblo de Līgatne — casas de madera para los obreros y las bodegas-cueva. Traiga calzado cómodo y almuerzo.$wl$,
  max_persons = 8,
  location_lat = 57.2306,
  location_lng = 25.04,
  meta_description_lv = $wl$Pilnas dienas pārgājiens Līgatnes dabas takās — savvaļas dzīvnieki, senlejas nogāzes un vecais papīrfabrikas ciemats. 6 stundas, no 45 EUR.$wl$,
  meta_description_en = $wl$Full-day hike on the Līgatne nature trails — wildlife, valley slopes and the old paper-mill village. 6 hours, from EUR 45.$wl$,
  meta_description_es = $wl$Caminata de día completo por los senderos de Līgatne — fauna salvaje, laderas del valle y el viejo pueblo papelero. 6 horas, desde 45 EUR.$wl$,
  sort_order = 13
where slug_lv = $wl$ligatnes-dabas-takas$wl$;

update public.services set
  slug_en = $wl$gauja-np-full-day-hike$wl$,
  slug_es = $wl$ruta-dia-completo-gauja$wl$,
  title_en = $wl$Gauja NP full-day hike$wl$,
  title_es = $wl$Ruta de día completo Gauja NP$wl$,
  short_description_lv = $wl$Izaicinošs 8 stundu pārgājiens tikai pieredzējušiem.$wl$,
  short_description_en = $wl$A challenging 8-hour hike for experienced hikers only.$wl$,
  short_description_es = $wl$Caminata exigente de 8 horas solo para senderistas experimentados.$wl$,
  description_lv = $wl$Astoņu stundu maršruts tiem, kas grib redzēt Gaujas senleju no gala līdz galam un nebaidās no garas dienas. Šis ir grūtākais no maniem pārgājieniem — apmēram divdesmit kilometri ar kāpumiem un nolaišanās posmiem pa nogāzēm, vietām pa nemarķētām takām.

Ejam pa senlejas malu, šķērsojot vietas, kur upe pagriežas un atsedz augstākās smilšakmens sienas. Pa ceļam ir vairāki punkti, kur mežs pēkšņi beidzas un paveras skats trīsdesmit metrus lejup. Ir posmi, kur jāiet pa saknēm un akmeņiem, un vismaz viena vieta, kur ceļš iet stāvi augšup — tur elpa pietrūkst visiem.

Dienas vidū apstājamies ilgākai pauzei pie upes. Nepieciešami labi pārgājienu apavi, vismaz pusotrs litrs ūdens un pusdienas. Der cilvēkiem ar normālu fizisko sagatavotību — nav vajadzīga sportista forma, bet astoņas stundas kājās ir astoņas stundas kājās.$wl$,
  description_en = $wl$An eight-hour route for those who want to see the Gauja valley end to end and are not afraid of a long day. This is the hardest of my hikes — around twenty kilometres with climbs and descents along the slopes, at times on unmarked paths.

We follow the edge of the ancient valley, crossing points where the river turns and exposes the highest sandstone walls. Along the way there are several places where the forest suddenly ends and a view opens thirty metres down. There are stretches over roots and stones, and at least one place where the path climbs steeply — everyone runs out of breath there.

Midday we stop for a longer break by the river. Good hiking boots, at least a litre and a half of water and lunch are required. Suitable for people with normal fitness — you do not need to be an athlete, but eight hours on your feet is eight hours on your feet.$wl$,
  description_es = $wl$Una ruta de ocho horas para quienes quieren ver el valle del Gauja de punta a punta y no temen un día largo. Es la más exigente de mis caminatas — unos veinte kilómetros con subidas y descensos por las laderas, a veces por sendas sin marcar.

Seguimos el borde del valle antiguo, cruzando puntos donde el río gira y deja al descubierto las paredes de arenisca más altas. Hay varios lugares donde el bosque se abre de golpe y aparece una vista treinta metros más abajo. Hay tramos sobre raíces y piedras, y al menos un punto donde el sendero sube con fuerza.

A mediodía paramos junto al río. Se requieren botas de montaña, litro y medio de agua y almuerzo. Apto para personas con forma física normal.$wl$,
  max_persons = 6,
  location_name = $wl$Gaujas NP$wl$,
  location_lat = 57.2,
  location_lng = 24.95,
  meta_description_lv = $wl$Gaujas NP dienas maršruts — 20 km pārgājiens ar gidi pa senlejas malu, augstākajām smilšakmens sienām un skatu vietām. 8 stundas, no 60 EUR.$wl$,
  meta_description_en = $wl$Gauja NP day route — a 20 km guided hike along the valley rim, the highest sandstone walls and viewpoints. 8 hours, from EUR 60.$wl$,
  meta_description_es = $wl$Ruta de día en el PN Gauja — 20 km de caminata guiada por el borde del valle y sus miradores. 8 horas, desde 60 EUR.$wl$,
  sort_order = 15
where slug_lv = $wl$gaujas-np-dienas-marsruts$wl$;

-- ── profile ────────────────────────────────────────────────────────────

update public.profile set
  role_lv = $wl$Sertificēta gide un ceļojumu organizētāja$wl$,
  role_en = $wl$Certified tour guide and travel organizer$wl$,
  role_es = $wl$Guía turística y organizadora de viajes certificada$wl$,
  bio_lv = $wl$Esmu Ilze — dzimusi un augusi Gaujas krastos. Mana aizraušanās ir stāstīt par vietām, kur akmens un koks glabā stāstus par gadsimtiem. Rādu Siguldu, Cēsis, Līgatni un Gaujas Nacionālo parku gan tiem, kas šeit ir pirmo reizi, gan tiem, kuri atgriežas.$wl$,
  bio_en = $wl$I am Ilze — born and raised on the banks of the Gauja. My passion is telling the stories that stone and wood have kept for centuries. I show Sigulda, Cēsis, Līgatne and Gauja National Park to both first-time visitors and returning guests.$wl$,
  bio_es = $wl$Soy Ilze, nacida y criada a orillas del Gauja. Mi pasión es contar las historias que la piedra y la madera guardan desde hace siglos. Muestro Sigulda, Cēsis, Līgatne y el Parque Nacional Gauja a visitantes y viajeros habituales.$wl$,
  short_bio_lv = $wl$Sertificēta gide ar vairāk nekā 10 gadu pieredzi Gaujas reģionā. Vadu ekskursijas, pārgājienus un piedāvāju privātos transferus.$wl$,
  short_bio_en = $wl$Certified guide with over 10 years of experience in the Gauja region. I lead tours, hikes and offer private transfers.$wl$,
  short_bio_es = $wl$Guía certificada con más de 10 años de experiencia en la región del Gauja. Ofrezco excursiones, senderismo y traslados privados.$wl$,
  phone = $wl$+371 20000000$wl$,
  email = $wl$ilze@wanderlust.lv$wl$,
  whatsapp = $wl$+37120000000$wl$,
  certifications = $wl$[{"name":"Sertificēta gide (LR)","year":2014},{"name":"Enter Gauja partneris","year":2024}]$wl$::jsonb
where full_name = $wl$Ilze Gulbe$wl$;

-- ── site_settings ──────────────────────────────────────────────────────

update public.site_settings set value = $wl$"info@wanderlust.lv"$wl$::jsonb where key = $wl$contact_email$wl$;
update public.site_settings set value = $wl$"+371 20042830"$wl$::jsonb where key = $wl$contact_phone$wl$;
update public.site_settings set value = $wl$"+37120042830"$wl$::jsonb where key = $wl$contact_whatsapp$wl$;
update public.site_settings set value = $wl$"https://facebook.com/wanderlust.lv"$wl$::jsonb where key = $wl$social_facebook$wl$;
update public.site_settings set value = $wl$"https://instagram.com/wanderlust.lv"$wl$::jsonb where key = $wl$social_instagram$wl$;

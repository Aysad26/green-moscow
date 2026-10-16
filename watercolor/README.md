# Зелёные острова Москвы — акварельный атлас

Самостоятельная версия гравюрного лендинга. URL: https://green-moscow-watercolor-anton.aysad26.chatgpt.site

## Дизайн и поведение

- Golos Text Regular / Medium / SemiBold. Шрифт поставляется локально; лицензия — `dist/assets/golos-OFL.txt`.
- Почти белый фон `#fdfdfa` и лёгкая бесшовная акварельная бумага (`dist/assets/watercolor-paper.webp`, тайл 384 px).
- Hero использует все 16 оригинальных прозрачных слоёв `Moscow_Watercolor_Scrap_Kit.zip` в координатах исходного manifest. Геометрия и облака сохранены.
- Каждый объект открывается отдельной SVG-маской: 15 неровных проходов кисти, небольшая неоднородность края и завершающая заливка остаточных точек. Маски не перемещают и не масштабируют рисунки. Последовательность после прелоадера занимает около 5 секунд.
- ВДНХ, Царицыно и Коломенское — новые акварельные композиции; появляются прорисовкой при входе в экран.
- Две бегущие строки, тихая геометрия, общая пауза циклов и поддержка reduced-motion.
- Карта, фильтры, карточки, мобильные диалоги и анкета сохранены из исходной версии. Данные и рассказы демонстрационные. Анкета показывает локальный предпросмотр; серверная отправка и модерация не подключены.
- Макет Figma: только desktop, с редактируемыми текстами, слоями и компонентами. Собирается после публикации.

## Проверка

Проверены HTML, ARIA, локальные ресурсы, CSS, JS, уникальность 22 масок и их маршруты, целостность и прозрачность изображений. Пройдены DOM-проверки поиска, фильтров, вкладок, масштаба, диалогов, безопасного отображения текста, паузы, прелоадера и scroll-reveal. В этой среде нет поддерживаемого browser QA, поэтому фактическое воспроизведение анимации в браузере не проверялось.

## Иллюстрации и промпты

Новые изображения созданы встроенной генерацией изображений по стилевому референсу `Moscow_Watercolor_Assembled.png`. Альфа сохранена. Сайт использует:

- `dist/assets/watercolor/vdnh.webp`
- `dist/assets/watercolor/tsaritsyno.webp`
- `dist/assets/watercolor/kolomenskoye.webp`

Общая часть фактических промптов:

> Use case: stylized-concept. Asset type: transparent watercolor illustration for the Green Moscow nature atlas website. Reference image is STYLE REFERENCE ONLY. Match its refined hand painted watercolor: delicate watery edges, fine recognizable architecture, sap green and sage foliage, warm white, restrained blue water, muted coral accents, granulated pigment and visible soft brush marks. New artwork, no typography, no watermark, no borders, no paper rectangle, no sky background. TRUE TRANSPARENT ALPHA all around, airy isolated miniature island with organically fading edges. Generous uncropped margins, landscape 3:2 composition, architecture rising in the middle, lush but not heavy trees either side, small patch of landscape and water at bottom. No birds, people or animals. Do NOT include geometric circles or rectangles; those are added as separate vector layers in the site. The painting must feel light on almost white paper. Subject:

ВДНХ:

> Moscow VDNH, the recognizable central white Pavilion No. 1 with its colonnade and slender gold spire and, in foreground, a delicately suggested golden Friendship of Peoples fountain with several small gold figures arranged around a basin. Airy green trees, open lawn, light blue reflection. Accurate overall landmark silhouettes and calm editorial watercolor, not an architectural technical drawing.

Царицыно:

> Moscow Tsaritsyno park, a recognizable red brick neo-Gothic palace with white stone trim, pointed roofs, towers, Gothic arches, and a small ornamental white-and-red brick arched bridge in front over a quiet blue pond. Lush sage linden trees. A coherent floating park island miniature; elegant asymmetrical composition, not a complete panorama.

Коломенское:

> Moscow Kolomenskoye park, the recognizable white tent-roof Church of the Ascension, tall narrow faceted stone tent, modest gold cross, white galleries at base. Church on a green river bluff with a path and one broad leafy tree, soft blue river below with fading reflection. Quiet, airy island miniature, two thirds lush landscape, one third white landmark. No other churches or busy skyline.

## Мобильная правка

Город увеличен ровно на 8% относительно первой публикации (130% → 140.4%; на узких экранах 138% → 149.04%). Убрано прежнее относительное смещение вниз; верхний отступ сокращён на 22 px. Круговая подпись перенесена вправо над городом и полностью помещается на экранах 320–680 px. Изменения ограничены мобильной вёрсткой; desktop Figma отражает настольную версию.

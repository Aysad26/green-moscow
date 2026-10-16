# Зелёные острова Москвы — Гравюрный атлас

Самостоятельный проект, созданный по аналогии с утверждённым акварельным вариантом. Исходный проект не изменён.

URL: https://green-moscow-engraving-anton.aysad26.chatgpt.site

## Реализация

Buildless HTML/CSS/JavaScript. Контентная сетка 1320 px, адаптивные диапазоны 320–1920 px. Wix Madefor Display / Text + Lora Regular / Italic, локальные WOFF и лицензии OFL. Курсивные акценты в заголовках, Lora Regular в крупной фразе; единый бумажный фон всех секций.

Hero: оригинальный гравюрный набор Moscow_Engraving_Scrap_Kit, слои города в точных координатах исходного manifest.json. Объекты появляются до геометрии. Теплоход неподвижен: только изменение прозрачности, без перемещения, параллакса, покачивания или бесконечной анимации.

Бегущая строка и две вращающиеся подписи построены средствами CSS/SVG. Общая пауза, отключение при prefers-reduced-motion, остановка циклов вне viewport. Новые SVG-иконки не требовались: сохранены существующие бинокль, диалог и скрепка.

Блок условий удалён из основного потока; краткие условия открываются в доступном dialog по кнопке в блоке участия. Неподключённое утверждённое положение обозначено явно.

Сохранены демонстрационная карта, поиск, фильтры, состояния пустого результата, масштабирование, вкладки и примеры историй. На мобильном — фильтры и информация о месте в диалогах. Анкета остаётся локальным предпросмотром; отправка, модерация и реальная карта не подключались.

## Проверка

Проверены структура HTML, уникальные IDs и ARIA-ссылки, все локальные ссылки и ресурсы, CSS, JavaScript и прозрачность графики. DOM-проверки покрывают поиск/фильтры/сброс, мобильные диалоги и восстановление фокуса, клавиатурные вкладки, масштабирование, безопасный предпросмотр анкеты, условия, паузу анимации и снятие прелоадера.

Browser QA недоступен в текущей среде; скриншоты страницы не снимались. Визуально проверены сами иллюстрации на целевых цветах. Размеры и переносы текста проверены по локальным шрифтам.

## Графика

Оригинальная гравюра: набор Moscow_Engraving_Scrap_Kit.zip, 19 слоёв. Компактные PNG-объекты переведены в WebP с сохранением альфа-канала. Ровные геометрические фигуры выполнены CSS.

Новые изображения сгенерированы встроенным image_gen по стилевому референсу из набора; прозрачность сохранена. Итоговые файлы проекта:

- dist/assets/engraving/observer.webp — синица, липа, бинокль и блокнот.
- dist/assets/engraving/dogs.webp — собаки на земле.
- dist/assets/engraving/park.webp — скамейка под липой и тропинка.

## Промпты новых иллюстраций

### observer

Use case: stylized-concept. Asset type: transparent PNG illustration for a Russian urban nature website. Input image is a STYLE REFERENCE ONLY: preserve the fine nineteenth-century copperplate crosshatching, crisp detail, warm ivory light on charcoal ink and subtle moss green hand tinting. New artwork, not editing the tree reference. Truly transparent background; generous clear margin all around, complete uncropped objects. No text, numbers, borders, circles, rectangles, watermark or paper background. No photography, no watercolor, no 3D. The illustration must work on warm ivory or dark forest green. Subject: a refined editorial still life of a small blank open field notebook, a compact elegant pair of binoculars leaning diagonally against it, a delicate leafy linden branch rising to the upper left, and a small European great tit perched on that branch. Contemporary nature observation, no antique adventurer costume. One coherent airy composition, binoculars and notebook near lower center, botanical branch and bird above. Notebook pages have only subtle tiny leaf sketches, absolutely no writing. Ivory paper with charcoal engraving lines; dark green binocular body; muted olive leaves; very restrained pale yellow bird breast. Square composition.

### dogs

Use case: stylized-concept. Asset type: transparent PNG illustration for a Russian urban nature website. Input image is a STYLE REFERENCE ONLY: preserve the fine nineteenth-century copperplate crosshatching, crisp detail, warm ivory light on charcoal ink and subtle moss green hand tinting. New artwork, not editing the tree reference. Truly transparent background; generous clear margin all around, complete uncropped objects. No text, numbers, borders, circles, rectangles, watermark or paper background. No photography, no watercolor, no 3D. The illustration must work on warm ivory or dark forest green. Subject: two graceful friendly medium-sized dogs meeting in a Moscow park, one slim dark-eared dog standing and the other light-coated dog sitting, in natural calm side and three-quarter poses. Accurate anatomy, attentive relaxed expressions, complete paws on a small lightly hatched patch of ground with a few blades of grass. No collars with text, no people, no scenery behind, no tall grass hiding paws. Restrained cream, charcoal and olive green engraving. Both dogs form one centered horizontal composition with negative space above.

### park

Use case: stylized-concept. Asset type: transparent PNG illustration for a Russian urban nature website. Input image is a STYLE REFERENCE ONLY: preserve the fine nineteenth-century copperplate crosshatching, crisp detail, warm ivory light on charcoal ink and subtle moss green hand tinting. New artwork, not editing the tree reference. Truly transparent background; generous clear margin all around, complete uncropped objects. No text, numbers, borders, circles, rectangles, watermark or paper background. No photography, no watercolor, no 3D. The illustration must work on warm ivory or dark forest green. Subject: an inviting quiet Moscow park clearing. A beautiful mature linden tree with an airy broad canopy on the left, a simple empty wooden park bench under its branches at lower center-right, a gently curved gravel footpath receding behind the bench into three smaller background trees. Open and asymmetrical, full canopy and trunk, natural perspective. No people, no animals, no buildings, no signs or lamps. Fine crisp ivory and charcoal engraving with subtle moss and sage hand tinting, gravel ground indicated by sparse crosshatching with an organic airy edge into transparency. Landscape composition.

## Craft motion — 16 October 2026

- Crisp SVG contours soften the water and front tree base, without blurring engraving detail.
- A 2.2 px animated SVG displacement gives the water a small ripple. The ship remains completely stationary and fades in only.
- Notebook illustration: `dist/assets/engraving/observer-blank-pages.webp` is the registered blank background. An SVG mask traces the original botanical drawings over it, then reveals the fine hatching. Original illustrated `observer.webp` is preserved.
- Dogs are a separate foreground layer: opacity 0 and scale 1.075 (1.06 mobile), settling to scale 1 after the background.
- The final tree canopy receives a 1.6 px ripple; the bench and path remain in the static layer.
- Two 192 px seamless procedural grain SVG tiles crossfade slowly over the continuous paper background.
- Green and outline buttons, filters and tabs share a 16 px radius (14 px mobile). Photo version keeps its pill buttons.
- A second, slower ticker introduces the map. The engraving-specific pin has a double outline and subtle fine hatch marks, with a clear center for counts.
- OS reduced-motion settings reveal everything immediately and disable loops. The common pause control stops both tickers, rotating labels, paper texture and ripple timelines; ripple timelines also stop when scenes are offscreen or the tab is hidden.

### Notebook background edit
Built-in image generation was used for the bitmap edit; original alpha and composition were preserved. Final asset: `dist/assets/engraving/observer-blank-pages.webp`.

Prompt: Remove only the two botanical line drawings inside the open notebook pages. Preserve blank warm ivory paper grain, all real leaves and flowers, bird, branches, notebook edges, binding and binoculars in the exact original square composition. Preserve the transparent alpha background, camera, proportions and engraving style. No text, new objects, cropping or repositioning.

Validation: HTML/ARIA/assets, SVG and CSS parsing, image alpha, JavaScript syntax, map and mobile interactions, motion pause/visibility/reduced-motion logic. Native Figma layouts reviewed visually. Browser motion playback could not be verified in this environment.

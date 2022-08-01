# notes

## absolute import 
to successfully import a module without `../` all around ( just in create-react project) .

```json
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

## css effect list

- mix-blend-mode : content with his background and elment's parent contant

- filter: applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.

- background-blend-mode : sets how an element's background images should blend with each other and with the element's background color.

  background-blend-mode: darken, luminosity;
- backdrop-filter : apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything behind the element, to see the effect you must make the element or its background at least partially transparent.
- clip-path : creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
- -webkit-mask-clip :
- image-rendering [crisp-edges|pixelated]: sets an image scaling algorithm. The property applies to an element itself, to any images set in its other properties, and to its descendants.
- -webkit-mask-image: radial-gradient(circle closest-side at var(--progress) center, black 30%, transparent);

## What I learn

- `grid-row-end: span 100` can make one item take whole avilable space without rise `overflow scroll` if parent not have `height 100%; align-content: center` 
- = turn:0-1, timout:0-1 |=> turn + (1-2turn)*timout 
  --turn-progress: calc(var(--turn, 0) + (1 - 2 * var(--turn)) * var(--timeout, 0) );
- simple algo to rotation array
- how splice k from end of array.
- sun in just with background:

  background-image: radial-gradient(circle at var(--progress) center, white 5%, transparent 10% 50%),
  repeating-conic-gradient(
  from var(--deg) at var(--progress) center,
  hsl(0 0% 100% /.2) 0deg 10deg,
  hsl(0 0% 100% / 0) 10deg 20deg,
  var(--player-color) 20deg 30deg
  ),

  -webkit-mask-image: radial-gradient(circle closest-corner at var(--progress) center, black 30%, transparent 70%);
- 
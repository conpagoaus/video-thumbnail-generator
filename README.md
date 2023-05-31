# Video Thumbnail Generator

## Quick Start

```js
import ThumbnailGenerator from "@conpagoaus/video-thumbnail-generator";
// const ThumbnailGenerator = require('@conpagoaus/video-thumbnail-generator').default;

const tg = new ThumbnailGenerator({
  sourcePath: "/tmp/test.mp4",
  thumbnailPath: "/tmp/",
  tmpDir: "/some/writeable/directory", //only required if you can't write to /tmp/ and you need to generate gifs
});

const thumbs = await tg.generate();
console.log(thumbs);
// [ 'test-thumbnail-320x240-0001.png',
//  'test-thumbnail-320x240-0002.png',
//  'test-thumbnail-320x240-0003.png',
//  'test-thumbnail-320x240-0004.png',
//  'test-thumbnail-320x240-0005.png',
//  'test-thumbnail-320x240-0006.png',
//  'test-thumbnail-320x240-0007.png',
//  'test-thumbnail-320x240-0008.png',
//  'test-thumbnail-320x240-0009.png',
//  'test-thumbnail-320x240-0010.png' ]

const thumbPath = await tg.generateOneByPercent(90);
console.log(thumbPath);
// 'test-thumbnail-320x240-0001.png'

const thumbPath = await tg.generateGif();
console.log(thumbPath);
// '/full/path/to/video-1493133602092.gif'
```

## Options

There are options that can be passed when generating thumbnails. Both `ThumbnailGenerate.generate(opts)` and `ThumbnailGenerate.generateOneByPercent(number, opts)` can take options. See example below to get screenshots at a resolution of 200x200:

### When generating screenshots/thumbnails

```js
const thumbs = await tg.generate({
  size: "200x200",
});
console.log(thumbs);
// [ 'test-thumbnail-200x200-0001.png',
//  'test-thumbnail-200x200-0002.png',
//  'test-thumbnail-200x200-0003.png',
//  'test-thumbnail-200x200-0004.png',
//  'test-thumbnail-200x200-0005.png',
//  'test-thumbnail-200x200-0006.png',
//  'test-thumbnail-200x200-0007.png',
//  'test-thumbnail-200x200-0008.png',
//  'test-thumbnail-200x200-0009.png',
//  'test-thumbnail-200x200-0010.png' ]
```

The `opts` above can take anything that options in [fluent-ffmpeg's Screenshots allow](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#screenshotsoptions-dirname-generate-thumbnails)

### When generating gifs

```js
await tg.generateGif({
  fps: 0.75, //how many frames per second you want in your gif
  scale: 180, //the smaller the number, the smaller the thumbnail
  speedMultiple: 4, //this is 4x speed
  deletePalette: true, //to delete the palettefile that was generated to create the gif once gif is created
});
```

## Tests

```bash
yarn test
```

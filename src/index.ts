import ffmpeg from "fluent-ffmpeg";
import _ from "lodash";
import * as stream from "stream";
import { deleteSync } from "del";

interface CmdOptions {
  fps?: number;
  scale?: number;
  speedMultiplier?: number;
  deletePalette?: boolean;
  offset?: number;
  duration?: number;
  videoFilters?: string;
  fileName?: string;
}

export default class ThumbnailGenerator {
  sourcePath: string | stream.Readable | undefined;
  thumbnailPath: string;
  count: number;
  percent: string;
  logger: null;
  size: string;
  fileNameFormat: string;
  tmpDir: string;
  // FfmpegCommand: typeof FfmpegCommand;

  /**
   * @constructor
   *
   * @param {String} [opts.sourcePath] - 'full path to video file'
   * @param {String} [opts.thumbnailPath] - 'path to where thumbnail(s) should be saved'
   * @param {Number} [opts.count] - 'number of thumbnails to generate'
   * @param {Number} [opts.percent]
   * @param {String} [opts.size]
   * @param {Logger} [opts.logger]
   */
  constructor(opts: {
    sourcePath: string | stream.Readable | undefined;
    thumbnailPath: string;
    count?: number;
    percent?: string;
    logger?: null;
    size?: string;
    tmpDir?: string;
  }) {
    this.sourcePath = opts.sourcePath;
    this.thumbnailPath = opts.thumbnailPath;
    this.count = opts.count || 10;
    this.percent = `${opts.percent}%` || "90%";
    this.logger = opts.logger || null;
    this.size = opts.size || "320x240";
    this.fileNameFormat = "%b-thumbnail-%r-%000i";
    this.tmpDir = opts.tmpDir || "/tmp";

    // by including deps here, it is easier to mock them out
    // FfmpegCommand.setFfmpegPath(ffmpegInstaller.path);
    // FfmpegCommand.setFfprobePath(ffproveInstaller.path);
    // this.FfmpegCommand = FfmpegCommand;
  }

  getFfmpegInstance(): ffmpeg.FfmpegCommand {
    return ffmpeg({
      source: this.sourcePath,
    });
  }

  /**
   * Method to generate one thumbnail by being given a percentage value.
   *
   * @method generateOneByPercent
   *
   * @param {Number} percent
   * @param {String} [opts.folder]
   * @param {String} [opts.size] - 'i.e. 320x320'
   * @param {String} [opts.filename]
   *
   * @return {Promise}
   *
   * @public
   *
   * @async
   */
  async generateOneByPercent(
    percent: number,
    opts?: {
      folder: string;
      filename?: string;
      size?: string;
    }
  ): Promise<any> {
    if (percent < 0 || percent > 100) {
      return Promise.reject(new Error("Percent must be a value from 0-100"));
    }

    const settings = _.assignIn(opts, {
      count: 1,
      timestamps: [`${percent}%`],
    });

    const result = await this.generate(settings);
    return result.pop();
  }

  /**
   * Method to generate thumbnails
   *
   * @method generate
   *
   * @param {String} [opts.folder]
   * @param {Number} [opts.count]
   * @param {String} [opts.size] - 'i.e. 320x320'
   * @param {String} [opts.filename]
   *
   * @return {Promise}
   *
   * @public
   *
   * @async
   */
  generate(opts?: {
    count: number;
    filename?: string;
    size?: string;
  }): Promise<any[]> {
    const defaultSettings = {
      folder: this.thumbnailPath,
      count: this.count,
      size: this.size,
      filename: this.fileNameFormat,
      logger: this.logger,
    };

    const ffmpeg = this.getFfmpegInstance();
    const settings = _.assignIn(defaultSettings, opts);
    let filenameArray: any[] = [];

    return new Promise((resolve, reject) => {
      function complete() {
        resolve(filenameArray);
      }

      function filenames(fns: any[]) {
        filenameArray = fns;
      }

      ffmpeg
        .on("filenames", filenames)
        .on("end", complete)
        .on("error", reject)
        .screenshots(settings);
    });
  }

  /**
   * Method to generate the palette from a video (required for creating gifs)
   *
   * @method generatePalette
   *
   * @param {string} [opts.videoFilters]
   * @param {string} [opts.offset]
   * @param {string} [opts.duration]
   * @param {string} [opts.videoFilters]
   *
   * @public
   */
  generatePalette(opts?: {
    offset?: number;
    duration?: number;
    videoFilters?: string;
  }): Promise<string> {
    const ffmpeg = this.getFfmpegInstance();
    const defaultOpts: CmdOptions = {
      videoFilters: "fps=10,scale=320:-1:flags=lanczos,palettegen",
    };
    const conf = _.assignIn(defaultOpts, opts);
    const inputOptions = ["-y"];
    const outputOptions = [`-vf ${conf.videoFilters}`];
    const output = `${this.tmpDir}/palette-${Date.now()}.png`;

    return new Promise((resolve, reject) => {
      function complete() {
        resolve(output);
      }

      if (conf.offset) {
        inputOptions.push(`-ss ${conf.offset}`);
      }

      if (conf.duration) {
        inputOptions.push(`-t ${conf.duration}`);
      }

      ffmpeg
        .inputOptions(inputOptions)
        .outputOptions(outputOptions)
        .on("end", complete)
        .on("error", reject)
        .output(output)
        .run();
    });
  }

  /**
   * Method to create a short gif thumbnail from an mp4 video
   *
   * @method generateGif
   *
   * @param {Number} opts.fps
   * @param {Number} opts.scale
   * @param {Number} opts.speedMultiple
   * @param {Boolean} opts.deletePalette
   *
   * @return {Promise}
   *
   * @public
   */
  async generateGif(opts?: {
    fps?: number;
    scale?: number;
    speedMultiplier?: number;
    deletePalette?: boolean;
  }): Promise<string> {
    const ffmpeg = this.getFfmpegInstance();
    const defaultOpts: CmdOptions = {
      fps: 0.75,
      scale: 180,
      speedMultiplier: 4,
      deletePalette: true,
    };
    const conf = _.assignIn(defaultOpts, opts);
    const inputOptions: string[] = [];
    const outputOptions = [
      `-filter_complex fps=${conf.fps},setpts=(1/${conf.speedMultiplier})*PTS,scale=${conf.scale}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
    ];
    const outputFileName = conf.fileName || `video-${Date.now()}.gif`;
    const output = `${this.thumbnailPath}/${outputFileName}`;

    const paletteFilePath = await this.generatePalette();

    if (conf.offset) {
      inputOptions.push(`-ss ${conf.offset}`);
    }

    if (conf.duration) {
      inputOptions.push(`-t ${conf.duration}`);
    }

    return new Promise((resolve, reject) => {
      outputOptions.unshift(`-i ${paletteFilePath}`);

      function complete() {
        if (conf.deletePalette === true) {
          deleteSync([paletteFilePath], {
            force: true,
          });
        }
        resolve(output);
      }

      ffmpeg
        .inputOptions(inputOptions)
        .outputOptions(outputOptions)
        .on("end", complete)
        .on("error", reject)
        .output(output)
        .run();
    });
  }
}

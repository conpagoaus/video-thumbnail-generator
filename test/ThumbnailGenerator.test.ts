import { describe, expect, it } from "vitest";

import sinon from "sinon";
import ThumbanilGenerator from "../src/index";

describe("ThumbanilGenerator", () => {
  describe("Thumbnail Generation by percent", () => {
    it("can generate a single thumbnail without any options", async () => {
      const tg = new ThumbanilGenerator({
        sourcePath: "/foo/bar.mp4",
        thumbnailPath: "~/",
      });

      sinon.stub(tg, "generate").callsFake(_opts => {
        return Promise.resolve(["generate-thumbnail.png"]);
      });

      await tg.generateOneByPercent(90);
    });

    it("throws an error if generating a single thumbnail with a percent over 100", async () => {
      const tg = new ThumbanilGenerator({
        sourcePath: "/foo/bar.mp4",
        thumbnailPath: "~/",
      });

      sinon.stub(tg, "generate").callsFake(_opts => {
        return Promise.resolve(["generate-thumbnail.png"]);
      });

      try {
        await tg.generateOneByPercent(101);
      } catch (error) {
        expect(error.message).toEqual("Percent must be a value from 0-100");
      }
    });

    it("throws an error if generating a single thumbnail with a percent under 0", async () => {
      const tg = new ThumbanilGenerator({
        sourcePath: "/foo/bar.mp4",
        thumbnailPath: "~/",
      });

      sinon.stub(tg, "generate").callsFake(_opts => {
        return Promise.resolve(["generate-thumbnail.png"]);
      });
      try {
        await tg.generateOneByPercent(-1);
      } catch (error) {
        expect(error.message).toEqual("Percent must be a value from 0-100");
      }
    });
  });
});

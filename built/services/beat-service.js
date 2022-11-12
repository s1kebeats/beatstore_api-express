'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
const PrismaClient = require('@prisma/client').PrismaClient;
const path = require('path');
const prisma = new PrismaClient();
const beatSelect = require('../prisma-selects/beat-select');
const beatIndividualSelect = require('../prisma-selects/beat-individual-select');
const ApiError = require('../exceptions/api-error');
const fileService = require('../services/file-service');
class BeatService {
  getBeats() {
    return __awaiter(this, void 0, void 0, function* () {
      const beats = yield prisma.beat.findMany({
        select: beatSelect,
      });
      return beats;
    });
  }
  findBeats({ tags = [], q, bpm, sort }) {
    return __awaiter(this, void 0, void 0, function* () {
      const queryArgs = {
        orderBy: { [sort ? sort : 'id']: 'desc' },
        where: {},
      };
      if (q) {
        queryArgs.where = {
          OR: [
            {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              author: {
                OR: [
                  {
                    username: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                  {
                    displayedName: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ],
        };
      }
      if (tags.length) {
        queryArgs.where.tags = {
          some: {
            id: {
              in: tags,
            },
          },
        };
      }
      if (bpm) {
        queryArgs.where.bpm = {
          equals: bpm,
        };
      }
      const beat = yield prisma.beat.findMany(queryArgs);
      return beat;
    });
  }
  getBeatById(id) {
    return __awaiter(this, void 0, void 0, function* () {
      const beat = yield prisma.beat.findUnique({
        where: {
          id,
        },
        select: beatIndividualSelect,
      });
      const relatedBeats = yield this.findBeats({
        tags: beat.tags,
        q: beat.user.username,
      });
      return Object.assign(Object.assign({}, beat), { related: relatedBeats });
    });
  }
  // file validation function with extension and maxSize
  validateFile(file, extensions, maxSize) {
    // extensions validation
    if (extensions) {
      // get file extension
      const ext = path.extname(file.name);
      // multiple
      if (Array.isArray(extensions)) {
        if (!extensions.includes(ext)) {
          throw ApiError.BadRequest(
            `Отправьте файл в формате ${extensions.join('/')}`
          );
        }
      } else {
        // single
        if (ext !== extensions) {
          throw ApiError.BadRequest(`Отправьте файл в формате ${extensions}`);
        }
      }
    }
    // maxSize validation
    if (maxSize) {
      if (file.size > maxSize) {
        throw ApiError.BadRequest(
          `Максимальный размер файла ${maxSize / 1024 / 1024}мб`
        );
      }
    }
  }
  validateBeat(beat) {
    // required beat data check
    if (!beat.wave || !beat.mp3) {
      throw ApiError.BadRequest('Недостаточно информации');
    }
    // tags check
    if (beat.tags && !Array.isArray(beat.tags)) {
      throw ApiError.BadRequest('Неверные теги');
    }
    // files validation
    // wave check
    this.validateFile(
      beat.wave,
      '.wav',
      // 300mb
      300 * 1024 * 1024
    );
    // mp3 check
    this.validateFile(
      beat.mp3,
      '.mp3',
      // 150mb
      150 * 1024 * 1024
    );
    // image check
    if (beat.image) {
      this.validateFile(beat.image, ['.png', '.jpg', '.jpeg']);
    }
    // stems check
    if (beat.stems || beat.stemsPrice) {
      if (!beat.stems) {
        throw ApiError.BadRequest('Отправьте trackout архив');
      }
      if (!beat.stemsPrice) {
        throw ApiError.BadRequest('Добавьте цену на trackout');
      }
      this.validateFile(
        beat.stems,
        ['.zip', '.rar'],
        // 500mb
        500 * 1024 * 1024
      );
    }
  }
  beatAwsUpload(beat) {
    return __awaiter(this, void 0, void 0, function* () {
      const fileData = [null, null, null, null];
      fileData[0] = fileService.awsUpload(beat.wave, 'wave/');
      fileData[1] = fileService.awsUpload(beat.mp3, 'mp3/');
      if (beat.image) {
        fileData[2] = fileService.awsUpload(beat.image, 'image/');
      }
      if (beat.stems) {
        fileData[3] = fileService.awsUpload(beat.stems, 'stems/');
      }
      const data = yield Promise.all(fileData).then((values) => {
        return {
          wave: values[0].Key,
          mp3: values[1].Key,
          image: values[2] ? values[2].Key : null,
          stems: values[3] ? values[3].Key : null,
        };
      });
      return data;
    });
  }
  uploadBeat(beat) {
    return __awaiter(this, void 0, void 0, function* () {
      // aws upload + prisma create
      const fileData = yield this.beatAwsUpload(beat);
      const beatFromDb = yield prisma.beat.create({
        data: Object.assign(Object.assign({}, beat), fileData),
      });
      return beatFromDb;
    });
  }
}
module.exports = new BeatService();
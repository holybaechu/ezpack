"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseMirror_1 = require("../classes/BaseMirror");
const axios_1 = __importDefault(require("axios"));
const BaseModFile_1 = require("../interfaces/BaseModFile");
const moment_1 = __importDefault(require("moment/moment"));
module.exports = class Modrinth extends BaseMirror_1.BaseMirror {
    constructor() {
        super(...arguments);
        this.name = "Modrinth";
    }
    getModBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Mod = (yield axios_1.default.get("https://api.modrinth.com/v2/project/" + slug)).data;
                if (!Mod) {
                    return undefined;
                }
                // Getting latest file
                const VersionData = (yield axios_1.default.get(`https://api.modrinth.com/v2/project/${slug}/version/${Mod.versions[Mod.versions.length - 1]}`)).data;
                const latestFile = new BaseModFile_1.BaseModFile();
                latestFile.hashes.sha1 = VersionData.files[0].hashes.sha1;
                latestFile.date = (0, moment_1.default)(VersionData.date_published);
                latestFile.downloadURL = VersionData.files[0].url;
                latestFile.id = VersionData.id;
                return {
                    slug: slug,
                    mirror: this,
                    idFromMirror: Mod.id,
                    latestFile: latestFile
                };
            }
            catch (e) {
                console.log(e);
                return undefined;
            }
        });
    }
    getVersionByGameVersion(game_version, modId, modLoader) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionsRes = yield axios_1.default.get(`https://api.modrinth.com/v2/project/${modId}/version`, {});
            const versions = versionsRes.data.reverse();
            let matchVersion;
            // for (let version of versions){
            //     const baseVersion = game_version.split(".")[0] + '.' + game_version.split(".")[1]
            //     if (version.game_versions.includes(baseVersion) && version.loaders.includes(modLoader)){
            //         matchVersion = version
            //     }
            // }
            for (let version of versions) {
                if (version.game_versions.includes(game_version) && version.loaders.includes(modLoader)) {
                    matchVersion = version;
                }
            }
            if (!matchVersion)
                return;
            return matchVersion;
        });
    }
    getModFileByGameVersion(game_version, modId, modLoader) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchVersion = yield this.getVersionByGameVersion(game_version, modId, modLoader);
            const modFile = new BaseModFile_1.BaseModFile();
            modFile.date = (0, moment_1.default)(matchVersion.date_published);
            modFile.hashes.sha1 = matchVersion.files[0].hashes.sha1;
            modFile.downloadURL = matchVersion.files[0].url;
            modFile.id = matchVersion.id;
            return modFile;
        });
    }
    getUrlBySlug(slug) {
        return "https://modrinth.com/mod/" + slug;
    }
};

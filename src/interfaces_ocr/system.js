import { ocrID } from '../windows/Ocr/components/TextArea';
import { resolveResource } from '@tauri-apps/api/path';
import { Command } from '@tauri-apps/api/shell';
import { arch } from '@tauri-apps/api/os';
import { invoke } from '@tauri-apps/api';

export const info = {
    name: 'system',
    supportLanguage: {
        auto: 'chi_sim+eng+chi_tra+jpn+kor+fra+spa+rus+deu+ita+tur+por+vie+ind+tha+msa+ara+hin',
        zh_cn: 'chi_sim',
        zh_tw: 'chi_tra',
        en: 'eng',
        yue: 'chi_sim',
        ja: 'jpn',
        ko: 'kor',
        fr: 'fra',
        es: 'spa',
        ru: 'rus',
        de: 'deu',
        it: 'ita',
        tr: 'tur',
        pt: 'por',
        vi: 'vie',
        id: 'ind',
        th: 'tha',
        ms: 'msa',
        ar: 'ara',
        hi: 'hin',
    },
    needs: [],
};

export async function ocr(_, lang, setText, id) {
    const is_linux = await invoke('is_linux');
    const is_macos = await invoke('is_macos');

    if (is_linux) {
        const { supportLanguage } = info;
        const result = await invoke('system_ocr', { lang: supportLanguage[lang] });
        if (ocrID === id || id === 'translate') {
            setText(result);
        }
    } else if (is_macos) {
        const supportLanguage_for_macos = {
            auto: 'auto',
            zh_cn: 'zh-Hans',
            zh_tw: 'zh-Hant',
            en: 'en-US',
            yue: 'zh-Hans',
            ja: 'ja-JP',
            ko: 'ko-KR',
            fr: 'fr-FR',
            es: 'es-ES',
            ru: 'ru-RU',
            de: 'de-DE',
            it: 'it-IT',
            tr: 'tr-TR',
            pt: 'pt-PT',
            vi: 'vi-VN',
            id: 'id-ID',
            th: 'th-TH',
            ms: 'ms-MY',
            ar: 'ar-SA',
            hi: 'hi-IN',
        }
        const img_path = await invoke('system_ocr');
        const archName = await arch();

        const bin_path = await resolveResource(`resources/ocr-${archName}-apple-darwin`);
        const command = new Command(bin_path, [img_path, supportLanguage_for_macos[lang]]);

        const output = await command.execute();
        if (!output.code) {
            if (ocrID === id || id === 'translate') {
                setText(output.stdout);
            }
        } else {
            throw output.stderr;
        }
    } else {
        const result = await invoke('system_ocr');
        if (ocrID === id || id === 'translate') {
            setText(result);
        }
    }
}
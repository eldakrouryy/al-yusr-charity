<?php
/**
 * Link-preview image of a shared sebha with the person's name in it:
 *   /og-room.php?s={slug}  →  1200×630 JPEG
 *
 * The picture for the room's kind (public/og/base/room-{kind}.jpg, made by
 * scripts/og/render-misbaha-og.sh, the sebha with no text) gets its text written on the right:
 * the kind, «لروح المرحوم» / «بنية شفاء», the name, and a line asking to join. Linked from seo.php as og:image, so WhatsApp and Facebook show the name in the preview.
 *
 * GD does not join Arabic letters or lay out right-to-left, so the text is shaped here
 * (presentation forms) and reversed. Images are cached on disk by their text.
 * Anything missing (GD, FreeType, the room) → a redirect to the kind's fixed picture.
 */

declare(strict_types=1);

const OG_SITE = 'https://elyusr.org';
const OG_ROOMS_API = 'https://api.elyusr.org/api/v1/misbaha-rooms/';
const OG_VERSION = '2026.11c';

/** Room from the same 2-minute cache seo.php keeps, else from the API. */
function og_room(string $slug): ?array
{
    $dir = sys_get_temp_dir() . '/elyusr-seo';
    $file = $dir . '/room-' . sha1($slug) . '.json';
    if (is_file($file) && time() - filemtime($file) < 120) {
        $room = json_decode((string) file_get_contents($file), true);

        return is_array($room) ? $room : null;
    }
    if (! function_exists('curl_init')) {
        return null;
    }
    $ch = curl_init(OG_ROOMS_API . rawurlencode($slug));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 2, CURLOPT_TIMEOUT => 3, CURLOPT_HTTPHEADER => ['Accept: application/json']]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code !== 200) {
        return null;
    }
    $room = json_decode((string) $body, true)['data'] ?? null;
    if (is_array($room)) {
        if (! is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        @file_put_contents($file, json_encode($room), LOCK_EX);
    }

    return is_array($room) ? $room : null;
}

/**
 * The text on the right of the picture, top to bottom, with the same wording as the page title
 * (seo.php, memorialDuas.ts): [kicker, line above the name, name, line under it].
 */
function og_block(array $room): array
{
    $name = trim((string) preg_replace('/\s+/u', ' ', (string) ($room['name'] ?? '')));
    $kind = (string) ($room['kind'] ?? 'deceased');
    $female = ($room['gender'] ?? '') === 'f';
    if ($kind === 'sick') {
        return ['سبحة مشتركة - بنية الشفاء', 'بنية شفاء', $name, 'شاركوا بذكر ودعاء بنية الشفاء'];
    }
    if ($kind === 'group') {
        return ['سبحة مشتركة - ذكر جماعي', '', $name, 'كل ذكر بيتضاف لعداد واحد يشارك فيه الكل'];
    }
    $above = preg_match('/^(ال)?(مرحوم|مرحومة|فقيد|فقيدة|المغفور)/u', $name) ? 'لروح' : ($female ? 'لروح المرحومة' : 'لروح المرحوم');

    return ['سبحة مشتركة - لروح ' . ($female ? 'متوفاة' : 'متوفى'), $above, $name, ($female ? 'ادعولها' : 'ادعوله') . ' وشاركوا بتسبيحة أو استغفار'];
}

/* ───────────── Arabic shaping for GD ───────────── */

/** letter => [isolated, final, initial, medial]; two forms = joins only to the letter before it. */
function og_forms(): array
{
    static $f = null;
    if ($f !== null) {
        return $f;
    }
    $f = [
        0x0621 => [0xFE80], 0x0622 => [0xFE81, 0xFE82], 0x0623 => [0xFE83, 0xFE84], 0x0624 => [0xFE85, 0xFE86],
        0x0625 => [0xFE87, 0xFE88], 0x0626 => [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C], 0x0627 => [0xFE8D, 0xFE8E],
        0x0628 => [0xFE8F, 0xFE90, 0xFE91, 0xFE92], 0x0629 => [0xFE93, 0xFE94], 0x062A => [0xFE95, 0xFE96, 0xFE97, 0xFE98],
        0x062B => [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C], 0x062C => [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0], 0x062D => [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4],
        0x062E => [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8], 0x062F => [0xFEA9, 0xFEAA], 0x0630 => [0xFEAB, 0xFEAC],
        0x0631 => [0xFEAD, 0xFEAE], 0x0632 => [0xFEAF, 0xFEB0], 0x0633 => [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4],
        0x0634 => [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8], 0x0635 => [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC], 0x0636 => [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0],
        0x0637 => [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4], 0x0638 => [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8], 0x0639 => [0xFEC9, 0xFECA, 0xFECB, 0xFECC],
        0x063A => [0xFECD, 0xFECE, 0xFECF, 0xFED0], 0x0641 => [0xFED1, 0xFED2, 0xFED3, 0xFED4], 0x0642 => [0xFED5, 0xFED6, 0xFED7, 0xFED8],
        0x0643 => [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC], 0x0644 => [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0], 0x0645 => [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4],
        0x0646 => [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8], 0x0647 => [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC], 0x0648 => [0xFEED, 0xFEEE],
        0x0649 => [0xFEEF, 0xFEF0], 0x064A => [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4],
        0x067E => [0xFB56, 0xFB57, 0xFB58, 0xFB59], 0x0686 => [0xFB7A, 0xFB7B, 0xFB7C, 0xFB7D], 0x06A9 => [0xFB8E, 0xFB8F, 0xFB90, 0xFB91],
        0x06AF => [0xFB92, 0xFB93, 0xFB94, 0xFB95], 0x06CC => [0xFBFC, 0xFBFD, 0xFBFE, 0xFBFF],
    ];

    return $f;
}

/** Arabic text in logical order → the same text joined and in visual (left-to-right) order. */
function og_shape(string $text): string
{
    $forms = og_forms();
    $lamAlef = [0x0622 => [0xFEF5, 0xFEF6], 0x0623 => [0xFEF7, 0xFEF8], 0x0625 => [0xFEF9, 0xFEFA], 0x0627 => [0xFEFB, 0xFEFC]];
    // harakat and the dagger alef sit badly in GD: names read fine without them
    $text = (string) preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{06D6}-\x{06ED}]/u', '', $text);
    $cps = array_map('mb_ord', mb_str_split($text));
    $n = count($cps);
    $joinsNext = fn (int $cp): bool => $cp === 0x0640 || (isset($forms[$cp]) && count($forms[$cp]) === 4);
    $joinsPrev = fn (int $cp): bool => $cp === 0x0640 || (isset($forms[$cp]) && count($forms[$cp]) >= 2);

    $out = [];
    for ($i = 0; $i < $n; $i++) {
        $cp = $cps[$i];
        $prev = $i > 0 && $joinsNext($cps[$i - 1]);
        if ($cp === 0x0644 && $i + 1 < $n && isset($lamAlef[$cps[$i + 1]])) {
            $out[] = $lamAlef[$cps[$i + 1]][$prev ? 1 : 0];
            $i++;
            continue;
        }
        if (! isset($forms[$cp])) {
            $out[] = $cp;
            continue;
        }
        $f = $forms[$cp];
        $next = $i + 1 < $n && $joinsPrev($cps[$i + 1]) && count($f) === 4;
        if (count($f) === 4) {
            $out[] = $prev && $next ? $f[3] : ($prev ? $f[1] : ($next ? $f[2] : $f[0]));
        } else {
            $out[] = $prev && count($f) > 1 ? $f[1] : $f[0];
        }
    }
    $shaped = implode('', array_map('mb_chr', $out));

    // visual order: runs of Latin letters and digits keep their order, the rest is reversed
    $parts = preg_split('/([A-Za-z0-9\x{0660}-\x{0669}]+(?:[.\-][A-Za-z0-9\x{0660}-\x{0669}]+)*)/u', $shaped, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [];
    $visual = [];
    foreach (array_reverse($parts) as $p) {
        $visual[] = preg_match('/^[A-Za-z0-9\x{0660}-\x{0669}]/u', $p) ? $p : implode('', array_reverse(mb_str_split($p)));
    }

    return implode('', $visual);
}

function og_width(string $font, float $size, string $text): int
{
    $b = imagettfbbox($size, 0, $font, og_shape($text));

    return $b ? (int) abs($b[2] - $b[0]) : 0;
}

/** The largest size at which the name fits `max` pixels: one line, else two, else cut. */
function og_fit(string $font, string $name, int $max): array
{
    foreach ([64, 58, 52, 48] as $size) {
        if (og_width($font, $size, $name) <= $max) {
            return [$size, [$name]];
        }
    }
    // words, keeping «عبد الله», «أبو بكر», «أم كلثوم» together
    $words = [];
    foreach (explode(' ', $name) as $w) {
        $last = count($words) - 1;
        if ($last >= 0 && preg_match('/^(عبد|أبو|ابو|أم|ام|بن|بنت)$/u', $words[$last])) {
            $words[$last] .= ' ' . $w;
        } else {
            $words[] = $w;
        }
    }
    if (count($words) > 1) {
        foreach ([56, 50, 46, 42, 38] as $size) {
            $best = null;
            for ($k = 1; $k < count($words); $k++) {
                $lines = [implode(' ', array_slice($words, 0, $k)), implode(' ', array_slice($words, $k))];
                $w = max(og_width($font, $size, $lines[0]), og_width($font, $size, $lines[1]));
                if ($best === null || $w < $best[0]) {
                    $best = [$w, $lines];
                }
            }
            if ($best[0] <= $max) {
                return [$size, $best[1]];
            }
        }
    }
    $cut = $name;
    while (mb_strlen($cut) > 8 && og_width($font, 38, $cut . '…') > $max) {
        $cut = mb_substr($cut, 0, mb_strlen($cut) - 1);
    }

    return [38, [rtrim($cut) . ($cut === $name ? '' : '…')]];
}

/** Draws right-aligned text, its right edge at `right`, baseline at `y`. */
function og_text($img, string $font, float $size, int $right, int $y, string $text, int $color): void
{
    $shaped = og_shape($text);
    $b = imagettfbbox($size, 0, $font, $shaped);
    $w = $b ? abs($b[2] - $b[0]) : 0;
    imagettftext($img, $size, 0, (int) ($right - $w - ($b[0] ?? 0)), $y, $color, $font, $shaped);
}

/** JPEG bytes of the preview, or null when GD cannot do it here. */
function og_render(array $room, string $baseDir): ?string
{
    if (! function_exists('imagettftext') || ! function_exists('mb_str_split')) {
        return null;
    }
    $kind = in_array($room['kind'] ?? '', ['deceased', 'sick', 'group'], true) ? $room['kind'] : 'deceased';
    $base = $baseDir . '/og/base/room-' . $kind . '.jpg';
    $font = $baseDir . '/fonts/DINNextLTArabic-Bold.ttf';
    if (trim((string) ($room['name'] ?? '')) === '' || ! is_file($base) || ! is_file($font)) {
        return null;
    }
    $img = @imagecreatefromjpeg($base);
    if (! $img) {
        return null;
    }
    $lime = imagecolorallocate($img, 163, 230, 53);
    $gold = imagecolorallocate($img, 246, 231, 184);
    $white = imagecolorallocate($img, 255, 255, 255);
    $soft = imagecolorallocate($img, 226, 236, 230);
    [$kicker, $above, $name, $under] = og_block($room);
    [$size, $lines] = og_fit($font, $name, 600);

    // [text, size, color, gap above] — the block is centred on the middle of the sebha (y ≈ 292)
    $rows = [[$kicker, 26, $lime, 0]];
    if ($above !== '') {
        $rows[] = [$above, 34, $gold, 26];
    }
    foreach ($lines as $i => $line) {
        $rows[] = [$line, $size, $white, $i === 0 ? ($above !== '' ? 10 : 30) : 6];
    }
    $rows[] = [$under, 25, $soft, 26];
    $height = 0;
    foreach ($rows as [$t, $sz, $c, $gap]) {
        $height += $gap + (int) round($sz * 1.35);
    }
    $y = 292 - (int) ($height / 2);
    foreach ($rows as [$t, $sz, $c, $gap]) {
        $y += $gap + (int) round($sz * 1.05);
        og_text($img, $font, $sz, 1140, $y, $t, $c);
        $y += (int) round($sz * 0.3);
    }
    ob_start();
    imagejpeg($img, null, 86);
    imagedestroy($img);

    return (string) ob_get_clean();
}

if (! defined('OG_ROOM_NO_MAIN')) {
    $slug = (string) ($_GET['s'] ?? '');
    $fallback = static function (string $kind): void {
        header('Location: ' . OG_SITE . '/og/misbaha-' . $kind . '.jpg?v=' . OG_VERSION, true, 302);
        header('Cache-Control: public, max-age=600');
        exit;
    };
    if (! preg_match('/^[a-z0-9]{4,24}$/', $slug)) {
        $fallback('deceased');
    }
    $room = og_room($slug);
    $kind = in_array($room['kind'] ?? '', ['deceased', 'sick', 'group'], true) ? $room['kind'] : 'deceased';
    if (! $room || trim((string) ($room['name'] ?? '')) === '') {
        $fallback($kind);
    }
    // one file per wording: an edited name or kind makes a new image
    $cacheDir = sys_get_temp_dir() . '/elyusr-og';
    $cacheFile = $cacheDir . '/' . sha1(OG_VERSION . '|' . $kind . '|' . implode('|', og_block($room))) . '.jpg';
    $jpeg = is_file($cacheFile) ? (string) file_get_contents($cacheFile) : null;
    if (! $jpeg) {
        $jpeg = og_render($room, __DIR__);
        if (! $jpeg) {
            $fallback($kind);
        }
        if (! is_dir($cacheDir)) {
            @mkdir($cacheDir, 0700, true);
        }
        @file_put_contents($cacheFile, $jpeg, LOCK_EX);
    }
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . strlen($jpeg));
    header('Cache-Control: public, max-age=3600');
    header('X-Robots-Tag: noindex');
    echo $jpeg;
}

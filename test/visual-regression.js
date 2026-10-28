
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default;

function compareScreenshot(actualPath, baselinePath, diffPath) {
    // Pastikan file baseline tersedia
    if (!fs.existsSync(baselinePath)) {
        throw new Error(
            `Baseline tidak ditemukan: ${baselinePath}`
        );
    }

    // Pastikan file screenshot aktual tersedia
    if (!fs.existsSync(actualPath)) {
        throw new Error(
            `Screenshot aktual tidak ditemukan: ${actualPath}`
        );
    }

    // Baca kedua gambar
    const actual = PNG.sync.read(
        fs.readFileSync(actualPath)
    );

    const baseline = PNG.sync.read(
        fs.readFileSync(baselinePath)
    );

    // Periksa ukuran gambar
    if (
        actual.width !== baseline.width ||
        actual.height !== baseline.height
    ) {
        return {
            match: false,
            differentPixels: -1,
            differencePercent: 100,
            message: "Ukuran screenshot berbeda."
        };
    }

    // Siapkan gambar untuk menampilkan perbedaan
    const diff = new PNG({
        width: actual.width,
        height: actual.height
    });

    // Bandingkan piksel baseline dan aktual
    const differentPixels = pixelmatch(
        baseline.data,
        actual.data,
        diff.data,
        actual.width,
        actual.height,
        {
            threshold: 0.1
        }
    );

    // Simpan gambar diff
    fs.mkdirSync(path.dirname(diffPath), {
        recursive: true
    });

    fs.writeFileSync(
        diffPath,
        PNG.sync.write(diff)
    );

    // Hitung persentase perbedaan
    const totalPixels = actual.width * actual.height;

    const differencePercent =
        (differentPixels / totalPixels) * 100;

    // Toleransi maksimal 3%
    const match = differencePercent <= 3;

    return {
        match,
        differentPixels,
        differencePercent: Number(
            differencePercent.toFixed(3)
        ),
        message: match
            ? "Screenshot sesuai toleransi visual."
            : "Screenshot berbeda melebihi toleransi visual."
    };
}

module.exports = {
    compareScreenshot
};

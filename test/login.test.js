const fs = require("fs");
const path = require("path");
const { Builder, until } = require("selenium-webdriver");
const { expect } = require("chai");

const LoginPage = require("../pages/login-page");
const { compareScreenshot } = require("./visual-regression");

describe("SauceDemo - Login", function () {
    this.timeout(60000);

    let driver;
    let loginPage;

    const screenshotDir = path.join("screenshots", "actual");
    const baselineDir = path.join("screenshots", "baseline");

    async function captureAndCompare(name) {
        fs.mkdirSync(screenshotDir, { recursive: true });

        const actualPath = path.join(
            screenshotDir,
            `${name}.png`
        );

        const baselinePath = path.join(
            baselineDir,
            `${name}.png`
        );

        const diffPath = path.join(
            screenshotDir,
            `${name}-diff.png`
        );

        const image = await driver.takeScreenshot();
        fs.writeFileSync(actualPath, image, "base64");

        const result = compareScreenshot(
            actualPath,
            baselinePath,
            diffPath
        );

        console.log(
            `\nVisual Regression ${name}: ${result.message}`
        );

        if (result.differentPixels >= 0) {
            console.log(
                `Piksel berbeda: ${result.differentPixels}; ` +
                `persentase: ${result.differencePercent}%`
            );
        }

        expect(
            result.match,
            `${name}: ${result.message}`
        ).to.equal(true);
    }

    beforeEach(async function () {
        driver = await new Builder()
            .forBrowser("chrome")
            .build();

        await driver.manage().window().setRect({
            x: 0,
            y: 0,
            width: 1280,
            height: 800
        });

        loginPage = new LoginPage(driver);
        await loginPage.open();
    });

    afterEach(async function () {
        if (driver) {
            await driver.quit();
            driver = null;
        }
    });

    it("Positive - Login berhasil", async function () {
        await loginPage.login(
            "standard_user",
            "secret_sauce"
        );

        await driver.wait(
            until.urlContains("inventory.html"),
            10000
        );

        await loginPage.waitForInventory();

        const currentUrl = await driver.getCurrentUrl();

        expect(currentUrl).to.include("inventory.html");

        await driver.sleep(1500);

        await captureAndCompare("login-success");
    });

    it("Negative - Invalid username", async function () {
        await loginPage.login(
            "username_salah",
            "secret_sauce"
        );

        const errorMessage = await loginPage.getErrorMessage();

        expect(errorMessage).to.include(
            "Username and password do not match"
        );

        await driver.sleep(500);

        await captureAndCompare("invalid-username");
    });

    it("Negative - Wrong password", async function () {
        await loginPage.login(
            "standard_user",
            "password_salah"
        );

        const errorMessage = await loginPage.getErrorMessage();

        expect(errorMessage).to.include(
            "Username and password do not match"
        );

        await driver.sleep(500);

        await captureAndCompare("wrong-password");
    });

    it("Negative - Locked out user", async function () {
        await loginPage.login(
            "locked_out_user",
            "secret_sauce"
        );

        const errorMessage = await loginPage.getErrorMessage();

        expect(errorMessage).to.include(
            "Sorry, this user has been locked out."
        );

        await driver.sleep(500);

        await captureAndCompare("locked-out-user");
    });
});
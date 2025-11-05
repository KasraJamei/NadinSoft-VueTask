describe('UserProfileView - Settings Management', () => {
    // Define initial settings for the test environment
    const INITIAL_USER_SETTINGS = {
        name: 'Initial Tester',
        theme: 'light',
        locale: 'en',
        memberSince: '2024-01-01T13:30:00.000Z'
    };

    // Define selectors for key elements
    const NAME_INPUT_FIELD = 'input[value="Initial Tester"]';
    const SAVE_BUTTON = 'button.save-btn';

    beforeEach(() => {
        // Set up local storage for settings before visiting
        cy.window().then(win => {
            win.localStorage.setItem('userSettings', JSON.stringify(INITIAL_USER_SETTINGS));
        });

        // Visit the page
        cy.visit('http://localhost:5173/profile');

        // Check for existence of the Profile title
        cy.contains('User Profile');
    });

    // ----------------------------------------------------------------------
    // 1. Name Change: EDIT -> SAVE FLOW
    // ----------------------------------------------------------------------

    it('should follow the EDIT -> SAVE flow: edit name, show save button, and successfully save', () => {
        const NEW_NAME = 'Kasra Jamei';

        // 1. Initial State Check: Save button should not be in the DOM (v-if)
        cy.get(SAVE_BUTTON).should('not.exist');

        // 2. EDIT: Change the name
        const nameInput = cy.get(NAME_INPUT_FIELD);
        nameInput.clear().type(NEW_NAME);

        // 3. SHOW SAVE: Verify Save button appears
        cy.get(SAVE_BUTTON).contains('Save');

        // 4. SAVE: Click Save button
        cy.get(SAVE_BUTTON).click();

        // 5. Post-Save Check: Verify the Save button disappears again
        cy.get(SAVE_BUTTON).should('not.exist');

        // 6. Verify success notification
        cy.contains(NEW_NAME);

        // 7. Verify local storage is updated
        cy.window().then(win => {
            const settings = JSON.parse(win.localStorage.getItem('userSettings') as string);
            expect(settings.name).to.equal(NEW_NAME);
        });

        cy.wait(500);
    });

    it('should hide save button if name is unchanged or empty', () => {
        const nameInput = cy.get(NAME_INPUT_FIELD);

        // 1. Type the same name
        nameInput.clear().type(INITIAL_USER_SETTINGS.name);
        cy.get(SAVE_BUTTON).should('not.exist');

        // 2. Clear the name
        nameInput.clear();
        cy.get(SAVE_BUTTON).should('not.exist');

        cy.wait(500);
    });

    // ----------------------------------------------------------------------
    // 2. Language/Locale Change Functionality
    // ----------------------------------------------------------------------

    it('should change the locale to Farsi (fa) and update the UI direction', () => {
        // 1. Open Language Select
        cy.get('.v-select:contains("Language")').click();

        // 2. Select Farsi
        cy.get('.v-overlay-container').contains('.v-list-item-title', 'فارسی').click();

        // 3. Check RTL UI update (icon should shift)
        cy.get('h1 .v-icon').should('have.class', 'ms-2');

        // Verify local storage is updated
        cy.window().then(win => {
            const settings = JSON.parse(win.localStorage.getItem('userSettings') as string);
            expect(settings.locale).to.equal('fa');
        });

        cy.wait(500);
    });

    // ----------------------------------------------------------------------
    // 3. Theme Change Functionality
    // ----------------------------------------------------------------------

    it('should change the theme to Dark', () => {
        // 1. Open Theme Select
        cy.get('.v-select:contains("Theme")').click();

        // 2. Select Dark
        cy.get('.v-overlay-container').contains('.v-list-item-title', 'Dark').click();

        // 3. Verify theme is updated (checking Vuetify's theme icon)
        cy.get('.v-select:contains("Theme")').find('.mdi-brightness-4');

        cy.wait(500);
    });

    // ----------------------------------------------------------------------
    // 4. Date Formatting Verification (Member Since)
    // ----------------------------------------------------------------------

    it('should display the Member Since date correctly in the default locale (en)', () => {
        // The date chip should contain some value
        cy.get('.v-chip').invoke('text').should('not.be.empty');

        cy.wait(500);
    });

    it('should update the Member Since format when locale changes to Farsi', () => {
        // 1. Change locale to Farsi
        cy.get('.v-select:contains("Language")').click();
        cy.get('.v-overlay-container').contains('.v-list-item-title', 'فارسی').click();

        // 2. Verify the chip format updates (only checking that it's not the initial English format)
        cy.get('.v-chip').should('not.contain', '01/01/2024');

        cy.wait(500);
    });
});
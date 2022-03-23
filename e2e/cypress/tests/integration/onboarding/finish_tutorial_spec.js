// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @onboarding

import * as TIMEOUTS from '../../fixtures/timeouts';
import {generateRandomUser} from '../../support/api/user';

describe('Onboarding', () => {
    let testTeam;

    const {username, email, password} = generateRandomUser();

    before(() => {
        // # Disable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: false}});

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T402 Finish Tutorial', () => {
        // # Open team menu and click on "Team Settings"
        cy.uiOpenTeamMenu('Team Settings');

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            cy.get('#open_inviteEdit').should('be.visible').click();

            // # Enable any user with an account on the server to join the team
            cy.get('#teamOpenInvite').should('be.visible').click();
            cy.uiSaveAndClose();
        });

        // # Logout from sysadmin account
        cy.apiLogout();

        // # Visit the team url
        cy.visit(`/${testTeam.name}`);

        // # Attempt to create a new account
        cy.get('#signup', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();
        cy.get('#email').should('be.focused').and('be.visible').type(email);
        cy.get('#name').should('be.visible').type(username);
        cy.get('#password').should('be.visible').type(password);
        cy.get('#createAccountButton').should('be.visible').click();

        // * Check that the display name of the team the user was invited to is being correctly displayed
        cy.uiGetLHSHeader().findByText(testTeam.display_name);

        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        cy.get('.tour-tip__pulsating-dot-ctr').should('exist').click();

        // # Click next tip
        cy.findByText('Channels and direct messages');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Create and join channels');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Invite people to the team');
        cy.findByText('Next').click();

        // # Click previous tip
        cy.findByText('Send messages');
        cy.findByText('Previous').click();

        // # Click next tip
        cy.findByText('Invite people to the team');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Send messages');
        cy.findByText('Next').click();

        // # Reload the page without cache
        cy.reload(true);

        // # Click jump tip
        cy.findByText('Customize your experience');
        cy.findByText('Done').click();

        // * Check that 'Town Square' is currently being selected
        cy.get('.active', {timeout: TIMEOUTS.HALF_MIN}).within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        // # Assert that the tutorials do not appear
        cy.get('.tour-tip__pulsating-dot-ctr').should('not.exist');
    });
});
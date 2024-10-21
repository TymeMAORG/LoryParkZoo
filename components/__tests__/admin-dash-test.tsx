import React from 'react';
import renderer from 'react-test-renderer';
import AdminDashboard from '../../app/(tabs)/admin/index';

describe('AdminDashboard', () => {
    it('renders the correct title and date', () => {
        const tree = renderer.create(<AdminDashboard />).toJSON();
        expect(tree).toMatchSnapshot();

        const instance = renderer.create(<AdminDashboard />).root;
        const title = instance.findByProps({ children: 'Admin Dashboard' });
        expect(title).toBeTruthy();

        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });

        const dateText = instance.findByProps({ children: formattedDate });
        expect(dateText).toBeTruthy();
    });
});

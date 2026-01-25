import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TripProvider, useTrips } from '../../store/useStore';
import { useEffect } from 'react';

const TestComponent = () => {
    const { trips, addTrip } = useTrips();

    return (
        <div>
            <div data-testid="count">{trips.length}</div>
            <button onClick={() => addTrip({ title: 'New Trip', id: '123' })}>Add</button>
        </div>
    );
};

describe('TripStore', () => {
    it('adds a trip correctly', () => {
        render(
            <TripProvider>
                <TestComponent />
            </TripProvider>
        );

        expect(screen.getByTestId('count')).toHaveTextContent('0');

        fireEvent.click(screen.getByText('Add'));

        expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
});

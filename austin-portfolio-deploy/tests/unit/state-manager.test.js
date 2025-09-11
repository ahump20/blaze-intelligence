/**
 * Unit Tests for Blaze State Manager
 * Testing core state management functionality
 */

const { BlazeStateManager } = require('../../src/core/state-manager');

describe('BlazeStateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new BlazeStateManager({
      persistence: false // Disable persistence for tests
    });
  });

  afterEach(() => {
    stateManager.reset();
  });

  describe('State Setting and Getting', () => {
    test('should set and get simple values', () => {
      stateManager.set('user.name', 'Austin Humphrey');
      expect(stateManager.get('user.name')).toBe('Austin Humphrey');
    });

    test('should set and get nested objects', () => {
      const cardinalsData = {
        readiness: 86.65,
        trend: 'positive',
        lastUpdate: '2025-01-09T10:30:00Z'
      };
      
      stateManager.set('cardinals.analytics', cardinalsData);
      expect(stateManager.get('cardinals.analytics')).toEqual(cardinalsData);
      expect(stateManager.get('cardinals.analytics.readiness')).toBe(86.65);
    });

    test('should handle undefined paths gracefully', () => {
      expect(stateManager.get('nonexistent.path')).toBeUndefined();
    });

    test('should set deep nested paths', () => {
      stateManager.set('sports.mlb.teams.cardinals.performance.batting.avg', 0.284);
      expect(stateManager.get('sports.mlb.teams.cardinals.performance.batting.avg')).toBe(0.284);
    });
  });

  describe('State Subscriptions', () => {
    test('should notify subscribers on state changes', () => {
      const callback = jest.fn();
      stateManager.subscribe('cardinals.readiness', callback);
      
      stateManager.set('cardinals.readiness', 87.2);
      
      expect(callback).toHaveBeenCalledWith(87.2, undefined);
    });

    test('should unsubscribe properly', () => {
      const callback = jest.fn();
      const unsubscribe = stateManager.subscribe('test.value', callback);
      
      unsubscribe();
      stateManager.set('test.value', 'changed');
      
      expect(callback).not.toHaveBeenCalled();
    });

    test('should handle multiple subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      stateManager.subscribe('shared.value', callback1);
      stateManager.subscribe('shared.value', callback2);
      
      stateManager.set('shared.value', 'test');
      
      expect(callback1).toHaveBeenCalledWith('test', undefined);
      expect(callback2).toHaveBeenCalledWith('test', undefined);
    });

    test('should provide old and new values to subscribers', () => {
      const callback = jest.fn();
      stateManager.set('initial.value', 'old');
      stateManager.subscribe('initial.value', callback);
      
      stateManager.set('initial.value', 'new');
      
      expect(callback).toHaveBeenCalledWith('new', 'old');
    });
  });

  describe('State Validation', () => {
    test('should validate Cardinals readiness score range', () => {
      const setValidScore = () => stateManager.set('cardinals.readiness', 85.5);
      const setInvalidScore = () => stateManager.set('cardinals.readiness', 150);
      
      expect(setValidScore).not.toThrow();
      expect(setInvalidScore).toThrow('Cardinals readiness must be between 0 and 100');
    });

    test('should validate required sports data fields', () => {
      const validData = {
        team: 'Cardinals',
        league: 'MLB',
        performance: { overall: 85 }
      };
      
      const invalidData = {
        team: 'Cardinals'
        // missing required fields
      };
      
      expect(() => stateManager.set('sports.data', validData)).not.toThrow();
      expect(() => stateManager.set('sports.data', invalidData)).toThrow();
    });
  });

  describe('State Persistence', () => {
    test('should handle persistence configuration', () => {
      const persistentManager = new BlazeStateManager({
        persistence: true,
        storageKey: 'blaze-test-state'
      });
      
      persistentManager.set('persistent.value', 'test');
      expect(persistentManager.get('persistent.value')).toBe('test');
    });
  });

  describe('State Reset', () => {
    test('should reset all state to initial values', () => {
      stateManager.set('user.name', 'Austin');
      stateManager.set('cardinals.readiness', 88.5);
      
      stateManager.reset();
      
      expect(stateManager.get('user.name')).toBeUndefined();
      expect(stateManager.get('cardinals.readiness')).toBeUndefined();
    });

    test('should notify subscribers on reset', () => {
      const callback = jest.fn();
      stateManager.set('test.value', 'initial');
      stateManager.subscribe('test.value', callback);
      
      stateManager.reset();
      
      expect(callback).toHaveBeenCalledWith(undefined, 'initial');
    });
  });

  describe('Performance', () => {
    test('should handle rapid state updates efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        stateManager.set(`performance.test.${i}`, i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should handle many subscribers efficiently', () => {
      const callbacks = Array.from({ length: 100 }, () => jest.fn());
      
      callbacks.forEach(callback => {
        stateManager.subscribe('performance.test', callback);
      });
      
      const startTime = performance.now();
      stateManager.set('performance.test', 'value');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Should notify all in under 50ms
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });
});
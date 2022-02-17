const notPermitted = require('../server/notPermitted');

describe('notPermitted', () => {
  describe('when nothing is passed', () => {
    it('should return true (not permitted)', async () => {
      const response = notPermitted();
      expect(response).toBeTruthy();
    });
  });

  describe('when not logged in', () => {
    it('should return true (not permitted)', async () => {
      const response = notPermitted({ session: {} });
      expect(response).toBeTruthy();
    });
  });

  describe('when not logged in', () => {
    it('should callback \'You are not logged in\'', done => {
      const cb = data => {
        try {
          expect(data).toEqual(expect.arrayContaining(['You are not logged in']));
          done();
        } catch (error) {
          done(error);
        }
      };

      notPermitted({ session: {}, cb });
    });
  });

  describe('when user is logged in, but scope is not in user\'s permissions', () => {
    it('should return true (not permitted)', async () => {
      const response = notPermitted({
        scope: 'specific scope',
        session: { isLoggedIn: true, permissions: { 'not this scope': ['a', 'b'] } },
      });
      expect(response).toBeTruthy();
    });
  });

  describe('when user is logged in, but scope is not in user\'s permissions', () => {
    it('should callback \'You do not have permissions to do this\'', done => {
      const cb = data => {
        try {
          expect(data).toEqual(expect.arrayContaining(['You do not have permissions to do this']));
          done();
        } catch (error) {
          done(error);
        }
      };

      notPermitted({
        scope: 'specific scope',
        session: { isLoggedIn: true, permissions: { 'not this scope': ['a', 'b'] } },
        cb,
      });
    });
  });

  describe('when user is logged in, but permission not in user\'s permission scope', () => {
    it('should return true (not permitted)', async () => {
      const response = notPermitted({
        scope: 'specific scope',
        permission: 'specific action',
        session: { isLoggedIn: true, permissions: { 'specific scope': ['a', 'b'] } },
      });
      expect(response).toBeTruthy();
    });
  });

  describe(
    'when user is logged in, has permissions to the scope and permissions to the specific action',
    () => {
      it('should return false (permitted)', async () => {
        const response = notPermitted({
          scope: 'specific scope',
          permission: 'specific action',
          session: { isLoggedIn: true, permissions: { 'specific scope': ['a', 'b', 'specific action'] } },
        });
        expect(response).toBeFalsy();
      });
    },
  );
});

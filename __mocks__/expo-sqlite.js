module.exports = {
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => {}),
    getAllAsync: jest.fn(async () => []),
    getFirstAsync: jest.fn(async () => null),
    runAsync: jest.fn(async () => ({ changes: 1, lastInsertRowId: 1 })),
  })),
};

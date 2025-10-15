jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => next(),
    fields: () => (req, res, next) => next(),
    none: () => (req, res, next) => next(),
    any: () => (req, res, next) => next(),
  });

  multer.diskStorage = () => ({});
  multer.memoryStorage = () => ({});

  return multer;
});

jest.mock('formidable', () => ({
  formidable: jest.fn(),
  IncomingForm: jest.fn(),
}));

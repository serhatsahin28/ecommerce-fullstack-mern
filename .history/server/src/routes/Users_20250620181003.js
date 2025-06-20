const loginController = require('../controllers/loginController');

const router = express.Router();

router.post('/login', loginController);

module.exports = router;

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev')); // HTTP request logger middleware for node.js
app.use('/', express.static(path.join(__dirname, 'public'))); // 요청경로, 실제경로 (파일 감출 때 사용)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  name: 'session-cookie',
}));

const multer = require('multer');
const fs = require('fs');

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}


// req 요청정보, file 업로드한 파일 정보, done 함수
const upload = multer({ // 파일업로드 multipart/form-data node.js 미들웨어
  storage: multer.diskStorage({
    destination(req, file, done) { // 어디에
      done(null, 'uploads/');
    },
    filename(req, file, done) { // 어떤 이름으로
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'multipart.html'));
});

// 단일 파일 업로드
// app.post('/upload', upload.single('image'), (req, res) => {
//   console.log(req.file);
//   res.send('ok');
// });

// 멀티 파일 업로드
app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  res.send('ok');
});


app.get('/', (req, res, next) => {
  console.log('GET / 요청에서만 실행됩니다.');
  next();
}, (req, res) => {
  throw new Error('에러는 에러 처리 미들웨어로 갑니다.')
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});

// 주소를 첫번째 인수로 넣어주지 않으면, 미들웨어는 모든 요청에서 실행되고, 주소를 넣는다면 해당 요청에서만 실행됨
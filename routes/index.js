var express = require('express');
var router = express.Router();
const { collection, getDocs, addDoc , Timestamp, orderBy, query, where } = require("firebase/firestore");

router.get('/', function(req, res, next) {
  res.json({status: 'online'});
});

router.get('/words', async function(req, res, next) {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const skip = (page - 1) * perPage;

  const wordsCol = query(collection(req.firestore, 'words'), orderBy("createDate", "desc"));
  const wordsSnapshot = await getDocs(wordsCol);
  const wordsList = wordsSnapshot.docs.map(doc => doc.data()).slice(skip, skip + perPage);
  res.json({words :wordsList, count: wordsSnapshot.size});
});

router.get('/get_word_by_name', async function(req, res, next) {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const skip = (page - 1) * perPage;

  const search = req.query.search;

  const wordsCol = query(collection(req.firestore, 'words'), where('wordName', '==', search), orderBy("createDate", "desc"));
  const wordsSnapshot = await getDocs(wordsCol);
  const wordsList = wordsSnapshot.docs.map(doc => doc.data()).slice(skip, skip + perPage);
  res.json({words :wordsList, count: wordsSnapshot.size});
});

router.post('/addWord', async function(req, res, next) {
  const model = req.body;
  console.log(model);

  try {
    await addDoc(collection(req.firestore, "words"), {
      "def": model.def,
      "usage": model.usage,
      "createdBy": model.createdBy,
      "wordName": model.wordName,
      "createDate": Timestamp.fromDate(new Date())
    });
  } catch (error) {
    res.json({success: false, message: error});
  }

  res.json({success: true, message: 'And a new word is born!'});
});

module.exports = router;

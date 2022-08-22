var express = require('express');
var router = express.Router();
const { collection, getDocs, addDoc , Timestamp, orderBy, query, limit } = require("firebase/firestore");

router.get('/', function(req, res, next) {
  res.json({status: 'online'});
});

router.get('/words', async function(req, res, next) {
  const wordsCol = query(collection(req.firestore, 'words'), orderBy("createDate"), limit(30));
  const wordsSnapshot = await getDocs(wordsCol);
  const wordsList = wordsSnapshot.docs.map(doc => doc.data());
  res.json(wordsList);
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

var express = require('express');
var router = express.Router();
const { collection, getDocs, addDoc , Timestamp, orderBy, query, where, doc, getDoc, setDoc, writeBatch } = require("firebase/firestore");

router.get('/', function(req, res, next) {
  res.json({status: 'online'});
});

router.get('/words', async function(req, res, next) {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const skip = (page - 1) * perPage;

  const wordsCol = query(collection(req.firestore, 'words'), orderBy("createDate", "desc"));
  const wordsSnapshot = await getDocs(wordsCol);
  const wordsList = wordsSnapshot.docs.map(doc => { const word = doc.data(); word.id = doc.id; return word; }).slice(skip, skip + perPage);
  res.json({words :wordsList, count: wordsSnapshot.size});
});

router.get('/get_word_by_name', async function(req, res, next) {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const skip = (page - 1) * perPage;

  const search = req.query.search;

  const wordsCol = query(collection(req.firestore, 'words'), where('wordName', '==', search), orderBy("createDate", "desc"));
  const wordsSnapshot = await getDocs(wordsCol);
  const wordsList = wordsSnapshot.docs.map(doc => { const word = doc.data(); word.id = doc.id; return word; }).slice(skip, skip + perPage);
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

router.post('/like_words', async function(req, res, next) {
  const model = req.body;
  console.log(model)

  try {
    const batch = writeBatch(req.firestore);
    for (const wordXlike of model) {
      const { word, docRef } = await getWordById(wordXlike.id, req.firestore);
      console.log('get word')
      if (word) {
        const updatedLikes = parseInt(word?.likes ?? 0)+(parseInt(wordXlike.newLikes) || 1);
        batch.set(docRef, { likes: updatedLikes }, { merge: true });
        console.log('batch set')
      }
    }
    await batch.commit();
    console.log('commit')
    console.log("Added likes in the batch")
    res.json({success: true, message: "Added likes in the batch"});
  } catch (error) {
    console.log(error)
    res.json({success: false, message: 'error'});
  }
});

async function getWordById(id, firestore) {
  const docRef = doc(firestore, "words", id );
  const docSnap = await getDoc(docRef);
  const word = docSnap.data();
  if (docSnap.exists())
    return {word, docRef};
  else return null;
}

router.post('/like_word/:wordId', async function(req, res, next) {
  const resp = req.params;

  try {
    const docRef = doc(req.firestore, "words", resp.wordId );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const word = docSnap.data();
      const updatedLikes = parseInt(word?.likes ?? 0) + 1;
      await setDoc(docRef, { likes: updatedLikes }, { merge: true });
      res.json({success: true, message: `Liked word: '${word.wordName}'`, likes: updatedLikes });
    } else {
      res.json({success: false, message: "No such document!"});
    }
  } catch (error) {
    console.log(error)
    res.json({success: false, message: error});
  }
});

module.exports = router;

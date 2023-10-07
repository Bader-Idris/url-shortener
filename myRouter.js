const mongoose = require('mongoose');
const router = require('express').Router();

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: [true, "Valid URL is required!"],
    unique: true
  },
  short_url: {
    type: Number
  }
});
const Site = mongoose.model("Site", urlSchema);

const findByURL = async (SiteName) => {
  try {
    const siteFound = await Site.find({ original_url: SiteName }).select('-_id original_url short_url');
    return siteFound;
  } catch (err) {
    throw new Error('Failed to find site by URL');
  }
};

const findByShortenNumber = async (shortNum) => {
  const siteFound = await Site.find({ short_url: shortNum }).select('-_id original_url short_url');
  return siteFound;
};


const createAndSaveSite = async (urlStr) => {
  let isMatch = /(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+(:\d{4})?(\/[\w?.\W]*)?(\?[\w?.\W]*)?(&[\w?.\W]*)?/ig;
  const tempRand = Number(Math.floor(Math.random() * 9e7));
  try {
    const site = new Site({
      original_url: urlStr.match(isMatch)[0],
      short_url: tempRand
    });

    const savedSite = await site.save();
    return savedSite;
  } catch (err) {
    throw new Error('Failed to create and save site');
  }
};

const postRes = async (req, res) => {
  const urlStr = req.body.url;
  if (!urlStr) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  let isMatch = /(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+(:\d{4})?(\/[\w?.\W]*)?(\?[\w?.\W]*)?(&[\w?.\W]*)?/ig;
  urlStr.match(isMatch);
  if (!urlStr.match(isMatch)) return res.status(400).json({ error: "Invalid URL" });
  try {
    const siteFound = await findByURL(urlStr.match(isMatch)[0]);
    if (siteFound.length > 0) return res.json(siteFound[0]);
    else {
      const savedSite = await createAndSaveSite(urlStr);
      return res.json({
        original_url: savedSite.original_url,
        short_url: savedSite.short_url
      });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getByParams = async (req, res) => {
  const shortenURL = Number(req.params.shortenCode);
  if (Number.isNaN(shortenURL)) {
    return res.status(400).json({ error: "Wrong format" });
  }
  try {
    const foundNumber = await findByShortenNumber(shortenURL);
    if (foundNumber.length === 0) {
      return res.status(404).json({ error: "No short URL found for the given input" });
    }
    const { original_url } = foundNumber[0];
    return res.redirect(original_url);
  } catch (err) {
    console.log(err)
    return res.status(404).json({ error: "No short URL found for the given input" });
  }
};

router.get('/shorturl/:shortenCode', getByParams);
router.post('/shorturl', postRes);

module.exports = router;
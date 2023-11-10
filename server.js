const fs = require('fs');
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const items = require("./data/products.json");
const customers = require("./data/customers.json");

app.set("etag", false);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/allMethods", () => {
  console.log("HH")
})
app.use(cors());

// get all item
app.get("/get-itemlist", (_, res) => {
  const productsPath = path.join(__dirname, 'data/products.json');
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: '데이터를 읽을 수 없습니다.' });
      return;
    }

    const products = JSON.parse(data);

    // imgPath 속성을 추가
    const productsWithImgPath = products.map(product => {
      if(product.imgPath){
        let readImgPath;
        fs.readFile(`./data/imgs/${product.imgPath}` ,(err, data) => {
          if(err) {
            console.error(err);
            res.status(500).json({ error : "데이터의 이미지 에러"})
            return
          }
          readImgPath = data;
        })
        console.log(readImgPath, "WTF")
        return product
      } else {
        return product;
      }
      
    });

    console.log(productsWithImgPath)

    res.json(productsWithImgPath);
  });
})

app.get('/api/get-image/:imgPath', (req, res) => {
  const imgPath = path.join(__dirname, 'data/imgs', req.params.imgPath);
  res.sendFile(imgPath);
});
// get all customers
app.get("/get-customers", (_, res) => {
  res.json(customers);
})

app.post("/add-product", (req, res) => {
  const newProduct = req.body;


  fs.readFile("data/products.json", 'utf-8', (err, data) => {
    if(err){
      console.error("파일을 읽을 수 없습니다.");
      return res.status(500).json({ error : "데이터를 읽을 수 없습니다."})
    }

    const jsonData = JSON.parse(data);
    const highestId = jsonData.reduce((max, item) => (item.itemId > max ? item.itemId : max), 0);

  newProduct.itemId = highestId + 1;
    jsonData.push(newProduct);

    fs.writeFile("data/products.json", JSON.stringify(jsonData, null, 2), 'utf-8', (err) => {
      if(err) {
        console.error("파일을 쓸 수 없습니다.");
        return res.status(500).json({ error : "파일을 쓸 수 없습니다."})
      }

      console.log("새 제품 등록 완료.");
      res.json({ message: '새 제품이 추가되었습니다.'})
    })
  })
})

app.listen(port, () => console.log(`Listening on port ${port}`));
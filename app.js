
export default function appScr(express, bodyParser, fs, crypto, http, CORS, User, m) {
    const app = express();
    const hu = {'Content-Type':'text/html; charset=utf-8',  ...CORS}
    let headers = {
        'Content-Type':'text/plain',
        ...CORS
    }
    const headersJSON={'Content-Type':'application/json', ...CORS};
    const headersCORS = {...CORS};

    app
        .use(bodyParser.urlencoded({extended:true}))       
        .all('/login/', r => {
            r.res.set(headers).send('artem_wr');
        })
        .all('/code/', r => {
            r.res.set(headers)
            fs.readFile(import.meta.url.substring(7),(err, data) => {
                if (err) throw err;
                r.res.end(data);
              });           
        })
        .all('/sha1/:input/', r => {
            r.res.set(headers).send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) =>{
            res.set(headers);
            let data = '';
            http.get(req.query.addr, async function(response) {
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                res.send(data)
            })
        })
        .post('/req/', r =>{
            r.res.set(headers);
            const {addr} = req.body;
            r.res.send(addr)
        })
        .post('/insert/', async r=>{
            r.res.set(headers);
            const {login,password,URL}=r.body;
            const newUser = new User({login,password});
            try{
                await m.connect(URL, {useNewUrlParser:true, useUnifiedTopology:true});
                try{
                    await newUser.save();
                    r.res.status(201).json({'Добавлено: ':login});
                }
                catch(e){
                    r.res.status(400).json({'Ошибка: ':'Нет пароля'});
                }
            }
            catch(e){
                console.log(e.codeName);
            }      
        })

    .all('/wordpress/', r =>{
        r.res.set(headersJSON).send({
            id: 1,
            title: {
              rendered: "artem_wr",
            },
          });
    })
    .all("/wordpress/wp-json/wp/v2/posts/", (r) => {
      r.res.set(headersJSON).send([{
        id: 1,
        title: {
          rendered: "artem_wr",
        },
      }]);
    })

    .all('/render/',async(req,res)=>{
        res.set(headersCORS);
        const {addr} = req.query;
        const {random2, random3} = req.body;
        
        http.get(addr,(r, b='') => {
            r
            .on('data',d=>b+=d)
            .on('end',()=>{
                fs.writeFileSync('views/index.pug', b);
                res.render('index',{login:'artem_wr',random2,random3})
            })
        })
    })
    .use(({res:r})=>r.status(404).set(hu).send('artem_wr'))
    .set('view engine','pug')

    return app;
}
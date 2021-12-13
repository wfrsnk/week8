
export default function appScr(express, bodyParser, fs, crypto, http, CORS, User, m) {
    const app = express();
    const path = import.meta.url.substring(7);
    const headersHTML = {'Content-Type':'text/html; charset=utf-8',...CORS}
    const headersTEXT = {'Content-Type':'text/plain',...CORS}
    const headersJSON={'Content-Type':'application/json',...CORS}
    const headersCORS={...CORS}; 

    app    
        .use(bodyParser.urlencoded({extended:true}))  
        .use(bodyParser.json()) 
        .all('/login/', r => {
            r.res.set(headersTEXT).send('artem_wr');
        })
        .all('/code/', r => {
            r.res.set(headersTEXT)
            fs.readFile(path,(err, data) => {
                if (err) throw err;
                r.res.end(data);
              });           
        })
        .all('/sha1/:input/', r => {
            r.res.set(headersTEXT).send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) =>{
            res.set(headersTEXT);
            let data = '';
            http.get(req.query.addr, async function(response) {
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                res.send(data)
            })
        })
        .post('/req/', r =>{
            r.res.set(headersTEXT);
            const {addr} = r.body;
            r.res.send(addr)
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
        .post('/insert/', async r=>{
            r.res.set(headersTEXT);
            const {login,password,URL}=r.body;
            const newUser = new User({login,password});
            try{
                await m.connect(URL, {useNewUrlParser:true, useUnifiedTopology:true});
                try{
                    await newUser.save();
                    r.res.status(201).json({'Add: ':login});
                }
                catch(e){
                    r.res.status(400).json({'Error: ':'No password'});
                }
            }
            catch(e){
                console.log(e.codeName);
            }      
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
        .use(({res:r})=>r.status(404).set(headersHTML).send('artem_wr'))
        .set('view engine','pug')
    return app;
}
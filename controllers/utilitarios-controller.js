const getFechaActual = (req,res, next)=> {    
    res.json({ fechaActual: new Date().toLocaleDateString('en-CA').substring (0,10) });
}

exports.getFechaActual = getFechaActual;

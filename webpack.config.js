const config = {
    entry: `${ __dirname }/src/app.js`,
    output: {
        path: `${ __dirname }/public/scripts`,
        filename: 'bundle.js'
    },
    mode: 'development'
};

module.exports = config;

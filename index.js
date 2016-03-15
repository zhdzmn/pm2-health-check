module.exports = function (app, opts) {
  app.get(opts.url || '/health', function (req, res) {
    var pm2 =  require('pm2');
    pm2.connect(function (err) {
      if (err) { res.sendStatus(500); return; }
      pm2.list(function (err, processes) {
        pm2.disconnect();
        if (err) { res.sendStatus(500); return; }
        var ok;
        if (opts.optimistic) {
        	ok = processes.every((process) => { return process.pm2_env.status === 'online'; });
        } else {
        	ok = processes.some((process) => { return process.pm2_env.status === 'online'; });
        }
        res.sendStatus(ok ? 200 : 500);
      });
    });
  });
};

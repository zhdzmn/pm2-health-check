# pm2-health-check
This is a pm2 health check middleware for the express framework.
It goes through all the pm2 processes to figure out if the processes are online and responds calculating that

usage 
```
var express = require('express');
var app = express();
var pm2HealthCheck = require('pm2-health-check'); 
pm2HealthCheck(app, {url: '/health-check-gizmo', optimistic: false});
```

this would mount the health check endpoint to the `<app_host>:<app_port>/health-check-gizmo`


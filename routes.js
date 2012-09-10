util = require('util');
moment = require('moment');
var jQuery = require('jquery');

// authenticate user based on the incoming request
function authenticate(req, res){
  if (req.session.auth && req.session.auth.loggedIn) {
    var splitemail = req.session.auth.google.user.email.split("@");
    var domain = splitemail[1];
    if (domain!='thesentinelproject.org'){
      return false;
    }
    return true;
  } else {
    return false;
  }
}

function load_routes(app) {
  exports.index = function(req, res){
    res.render('index', { locals: {
      title: 'Threatwiki',
      scripts: []
    }});
  };

  exports.soc = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jQuery.getJSON('http://localhost:3000/api/soc?callback=?', function(socs) {
        console.log(socs);

        // convert dates from ISO-8601 to string
        // consider doing this in a better way
        // one way is the write a virtual method for mongo date itself, but that is kinda sloppy
        for(i=0; i<socs.length; i++) {
          socs[i].created = moment(socs[i].created).format("MMMM Do YYYY");
          socs[i].modified = moment(socs[i].modified).format("MMMM Do YYYY");
        }

        res.render('socList', { locals: {
          title: 'SOC Manager',
          scripts: ['/javascript/soc_list.js'],
          socs: socs
        }});
      });
    } else {
        //force logout if user doesn't meet conditions to view the page
        res.redirect('/logout');
    }
  };

  exports.soc.create = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      res.render('socForm', { locals: {
        title: 'Create an SOC',
        scripts: ['/javascript/soc_form.js']
      }});
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.soc.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      console.log('http://localhost:3000/api/soc/'+ obj_id +'?callback=?');
      jQuery.getJSON('http://localhost:3000/api/soc/'+ obj_id +'?callback=?', function(soc) {
        res.render('socForm', { locals: {
          title: 'Edit SOC',
          scripts: ['/javascript/soc_form.js'],
          soc: soc
        }});
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };


  exports.soc.view = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var socname = req.query["soc"];
      var tagname = req.query["tag"];


      console.log('http://localhost:3000/api/datapoint/soc/'+ socname +'?callback=?');
      if (typeof(tagname) != 'undefined') {
        jQuery.getJSON('http://localhost:3000/api/datapoint/tag/'+ tagname +'?callback=?', function(datapoints) {
          jQuery.getJSON('http://localhost:3000/api/soc/title/'+ socname +'?callback=?', function(soc) {
            jQuery.getJSON('http://localhost:3000/api/tag/'+ tagname +'?callback=?', function(tag) {
              for(i=0; i<datapoints.length; i++) {
                datapoints[i].created = moment(datapoints[i].created).format("MMMM Do YYYY");
                datapoints[i].modified = moment(datapoints[i].modified).format("MMMM Do YYYY");
              }
              res.render('socView', { locals: {
                  title: 'Edit SOC',
                  scripts: ['/javascript/soc_view.js'],
                  datapoints: datapoints,
                  soc:soc,
                  tag:tag
              }});
            });
          });
        });
      } else {
        jQuery.getJSON('http://localhost:3000/api/datapoint/soc/'+ socname +'?callback=?', function(datapoints) {
          jQuery.getJSON('http://localhost:3000/api/soc/title/'+ socname +'?callback=?', function(soc) {
            jQuery.getJSON('http://localhost:3000/api/tag/soc/'+ socname +'?callback=?', function(tags) {
              for(i=0; i<datapoints.length; i++) {
                datapoints[i].created = moment(datapoints[i].created).format("MMMM Do YYYY");
                datapoints[i].modified = moment(datapoints[i].modified).format("MMMM Do YYYY");
              }
              res.render('socView', { locals: {
                  title: 'Edit SOC',
                  scripts: ['/javascript/soc_view.js'],
                  datapoints: datapoints,
                  soc:soc,
                  tags:tags
              }});
            });
          });
        });
      }

    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.datapoint = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jQuery.getJSON('http://localhost:3000/api/datapoint?callback=?', function(datapoints) {
        console.log(datapoints);
        // convert dates from ISO-8601 to string
        for(i=0; i<datapoints.length; i++) {
          datapoints[i].created = moment(datapoints[i].created).format("MMMM Do YYYY");
          datapoints[i].modified = moment(datapoints[i].modified).format("MMMM Do YYYY");
        }

        res.render('datapointList', { locals: {
          title: 'Datapoint Manager',
          scripts: ['/javascript/datapoint_list.js'],
          datapoints: datapoints
        }});
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.datapoint.create = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var socname = req.query["soc"];
      res.render('datapointForm', { locals: {
        title: 'Create Datapoint',
        scripts: ['/javascript/datapoint_form.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', '/javascript/jquery.auto-geocoder.js', '/javascript/utils.js'],
        socname:socname
      }});
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.datapoint.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      console.log('http://localhost:3000/api/datapoint/'+ obj_id +'?callback=?');

      jQuery.getJSON('http://localhost:3000/api/datapoint/'+ obj_id +'?callback=?', function(datapoint) {
        res.render('datapointForm', { locals: {
          title: 'Edit Datapoint',
          scripts: ['/javascript/datapoint_form.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', '/javascript/jquery.auto-geocoder.js', '/javascript/utils.js'],
          datapoint: datapoint
        }});
      });
    } else {
        //force logout if user doesn't meet conditions to view the page
        res.redirect('/logout');
    }
  };

  exports.tag = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jQuery.getJSON('http://localhost:3000/api/tag?callback=?', function(tags) {
        console.log(tags);

        // convert dates from ISO-8601 to string
        for(i=0; i<tags.length; i++) {
          tags[i].created = moment(tags[i].created).format("MMMM Do YYYY");
          tags[i].modified = moment(tags[i].modified).format("MMMM Do YYYY");
        }

        res.render('tagList', { locals: {
          title: 'Tag Manager',
          scripts: ['/javascript/tag_list.js'],
          tags: tags
        }});
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.tag.create = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      res.render('tagForm', { locals: {
        title: 'Create Tag',
        scripts: ['/javascript/tag_form.js']
      }});
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.tag.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      console.log('http://localhost:3000/api/tag/'+ obj_id +'?callback=?');
      jQuery.getJSON('http://localhost:3000/api/tag/'+ obj_id +'?callback=?', function(tag) {
        res.render('tagForm', { locals: {
          title: 'Edit Tag',
          scripts: ['/javascript/tag_form.js'],
          tag: tag
        }});
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };
}

exports.load_routes = load_routes;

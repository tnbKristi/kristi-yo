this.App = (function(Backbone, Marionette) {
  var App, Router, API;


  _.extend(Marionette.Renderer, {

    path: 'app/templates/',

    render: function(template, data) {
      var path = this.getTemplate(template);

      if(!path) {
        $.error("Template " + template + " not found!");
        return;
      }

      return path(data);
    },
    
    getTemplate: function(template) {
      return JST[this.path + template + '.hbs'];
    }
  });

  App = new Marionette.Application

  App.reqres = new Backbone.Wreqr.RequestResponse();

  App.addRegions({
    introRegion: '#intro-region',
    aboutRegion: '#about-region',
    skillsRegion: '#skills-region',
    workRegion: '#work-region',
    contactRegion: '#contact-region'
  });

  App.on('initialize:after', function() {
    console.log('app initd!');

    App.introRegion.show(new App.Views.IntroView());
    App.aboutRegion.show(new App.Views.AboutView());

    // Because we're handling data in the skills region,
    // we use a controller instead of calling the view directly.
    new App.Controllers.SkillsController({
      entity: App.request('entities:skills'),
      region: this.skillsRegion
    });

  });
  
  return App;

})(Backbone, Marionette);

;App.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {

  Entities.Skill = Backbone.Model.extend({
    defaults: {
      "name": "skill name",
      "rating": 5
    }
  });

  Entities.Skills = Backbone.Collection.extend({
    model: Entities.Skill,
    url: '/data/skills.json'
  });

  var API = {
    getSkills: function() {
      return new Entities.Skills();
    }
  };


  App.addInitializer(function() {

    App.reqres.setHandler('entities:skills', function() {
      return API.getSkills();
    });

  });

});;App.module("Views", function(Views, App, Backbone, Marionette, $, _) {

  /** VIEWS **
  * Each section of the site is it's own view.
  * In a larger-scale app, this would be broken down into
  * individual files, one for each view/controller,
  * and a module would be defined as it's component, such as "About".
  * The module "About", would then contain it's respective View & Controller,
  * properly encapsulating all of it's unique requirements from the rest of the app.
  * Yay modularity! :)
  */

  Views.IntroView = Marionette.ItemView.extend({
    template: 'intro',
    className: 'intro-block',

    onRender: function() {
      this.$el.attr({
        'data-0': 'top: 30%;',
        'data-500': 'top: 40%;'
      });
    }
  });

  Views.AboutView = Marionette.ItemView.extend({
    template: 'about',
    className: 'about-block',

    onRender: function() {
      var self = this;
      this.$el.css('opacity', 0);

      $('.intro-block').waypoint(function() {
        self.transitionIn();
      }, {
        offset: 10
      });

      this.$('.descrip').attr({
        'data-500': 'opacity: 1;',
        'data-1000': 'opacity: 0;'
      });

    },

    transitionIn: function() {
      this.$el.animate({
        'opacity': 1
      }, function() {
        var subLen = $('[class^="subline-"]').length;

        setTimeout(function() {

          $('[class^="subline-"]').each(function(idx) {
            var $el = $(this);

            setTimeout(function() {
              $el.addClass('expanded');
            }, 500 * idx);

          });

        }, 300);

        setTimeout(function() {
          $('.headline-2').css({'opacity': 1 });
        }, (500 * subLen) + 800)

      });
    }
  });

  Views.Skill = Marionette.ItemView.extend({
    template: 'skill-item',
    className: 'skill'
  });

  Views.SkillsView = Marionette.CompositeView.extend({
    template: 'skills',
    className: 'skills-block',
    itemView: Views.Skill,
    itemViewContainer: '.skills-list',

    onRender: function() {}
  });

});;App.module("Controllers", function(Controllers, App, Backbone, Marionette, $, _) {
  
  /** CONTROLLERS **
  * Controllers are a great way to pre-fetch dependencies
  * before rendering a view. It's also a great place to set up
  * events and request handlers specific for that section.
  * Because this is a single-page tiny site, we're clumping
  * our controllers together.
  *
  * In a large-scale app, modules would be defined by their component (ie, "About")
  * and all respective Views and Controllers would be included there.
  *
  * Controllers are awesome because they allow us more fine-grained control
  * with how we deliver views + data to our users. Here we can handle what we
  * might do if there is no data, for example, we might serve an entirely different view.
  */

  Controllers.SkillsController = Marionette.Controller.extend({

    initialize: function(options) {
      var self = this;

      if(!options.region) {
        $.error("Region is required.");
      }

      this.region = options.region;

      if(options.entity) {
        this.entity = options.entity;
      }

      this.entity.fetch({
        success: function() {
          self.showBaseView();
        }
      })
    },

    getBaseView: function() {
      this.baseView = new App.Views.SkillsView({
        collection: this.entity
      });

      return this.baseView;
    },

    showBaseView: function() {
      this.region.show(this.getBaseView());
    }

  });

});
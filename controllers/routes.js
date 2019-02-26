const Rental = require('../models/rental');
const express = require('express');
const router = express.Router();

// MailGun dependencies
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
// for access to keys
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.EMAIL_DOMAIN,
  },
};

// Nodemailer transport import
const nodemailerMailgun = nodemailer.createTransport(mg(auth));


//index

router.get('/', (req, res) => {
  Rental.find()
    .then(rentals => {
      res.render('rentals-index', {
        rentals: rentals
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// show

router.get('/rentals/view/:id', (req, res) => {
  Rental.findById(req.params.id).then((rental) => {
    res.render('rentals-show', {
      rental: rental
    })
  }).catch((err) => {
    console.log(err.message);
  })
});

// delete

router.delete('/rentals/view/:id', (req, res) => {
  console.log("Delete Rental");
  Rental.findByIdAndRemove(req.params.id).then((rental) => {
    res.redirect('/');
  }).catch((err) => {
    console.log(err.message);
  })
})
// edit page
router.get('/rentals/view/:id/edit', (req, res) => {
  Rental.findById(req.params.id, function(err, rental) {
    res.render('rentals-edit', {
      rental: rental
    });
  })
})


router.post('/rentals/view', (req, res) => {
  console.log(req.body);
  Rental.create(req.body).then((rental) => {
    rental.landlord = req.user
    console.log(rental);
    res.redirect(`/rentals/view/${rental._id}`);
  }).catch((err) => {
    console.log(err.message);
  })
})


router.put('/rentals/view/:id', (req, res) => {
  Rental.findByIdAndUpdate(req.params.id, req.body)
    .then(rental => {
      res.redirect(`/rentals/view/${rental._id}`)
    })
    .catch(err => {
      console.log(err.message);
    })
})

router.get('/rentals', (req, res) => {
  res.render('rentals-index', {})
})


router.get('/rentals/new', (req, res) => {
  res.render('rentals-new', {});
})

router.get('/rentals/search', (req, res) => {
  const term = new RegExp(req.query.term, 'i')

  Rental.find({
    $or: [

      {
        'neighborhood': term
      },
      {
        'type': term
      },

    ]
  }).exec((err, rentals) => {
    res.render('rentals-index', {
      rentals
    })
  })
});

router.get('/rentals/apply/:id', (req, res) => {


  Rental.findById(req.params.id).then((rental) => {
    console.log("here______________");
    console.log(rental);
    res.render('apply', { rental: rental ,
      PUBLIC_STRIPE_API_KEY: process.env.PUBLIC_STRIPE_API_KEY,

    })
  })
});

router.post(`/rentals/apply/:id/purchase`, (req, res) => {
  console.log('____________________________');
  console.log(`purchase body: ${req.body}`);
  // Set your secret key: remember to change this to your live secret key in production
  // See your keys here: https://dashboard.stripe.com/account/apikeys
  const stripe = require('stripe')(process.env.PRIVATE_STRIPE_API_KEY);
  //
  // // Token is created using Checkout or Elements!
  // // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  Rental.findById(req.params.id).then((rental) => {
    const charge = stripe.charges.create({
      amount: 5000,
      currency: 'usd',
      description: `Applied ${rental.name}, ${rental.neighborhood}`,
      source: token,
    }).then((chg) => {
      const user = {
        email: req.body.stripeEmail,
        amount: chg.amount / 100,
        rentalName: rental.name,
      };
      nodemailerMailgun.sendMail({
        from: 'no-reply@RentMe.com',
        to: user.email,
        subject: 'Application Sent',
        template: {
          name: 'email.handlebars',
          engine: 'handlebars',
          context: user,
        },
      }).then((info) => {
        console.log(`Response: ${ info}`);
        if (req.header('content-type') == 'application/json') {
          return res.json({})
        } else {
          res.redirect(`/rentals/view/:id/${req.params.id}`);
        }
      }).catch((err) => {
        console.log('Error: ' + err);
        res.redirect(`/rentals/view/${req.params.id}`);

      });
    });
  })
});

module.exports = router;

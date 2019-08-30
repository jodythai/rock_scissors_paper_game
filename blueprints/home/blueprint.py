from flask import Blueprint, render_template

homepage = Blueprint('homepage', __name__)

# Homepage
@homepage.route('/')
def render_homepage():
  return render_template('home.html')
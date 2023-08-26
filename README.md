# fullstack

A **full-stack** web application includes:

- a front-end user interface;
- a back-end API;
- a database;
- the systems and services keeping those running;
- and the repository of code for all of these components.

Even a simple app therefore involves several technological pieces:

- HTML, CSS, and Javascript for the front-end;
- a programming language of your choice (let's choose [Python](https://xkcd.com/353/)) for the backend; 
- SQL for the database;
- some Bash to get everything in place and running on its system;
- and Git for version control.

The aim of this project is to set up those essential pieces, so that
at the next [hackathon](https://kingdomcode.org.uk/build/) we can
quickly get started with making an app that would be useful to the
world, and help foodbanks manage their stock, churches share their
sermons, book-lovers catalogue their shelves, people pray for their
neighbourhoods -- and whatever else.

If you're a developer, then cloning this repo and get started:

```
git clone https://github.com/peterprescott/fullstack
cd fullstack
conda create --name fs_env python=3.11
conda activate fs_env
pip install -e .
python run.py
```

That run script should set up two threads: one to serve a front-end user
interface at [localhost:8000](http://localhost:8000), and the other to
run a back-end API at [localhost:5000](http://localhost:5000).

While you're getting that working, you should also be able to find a
working demo of the app [here](), with frontend hosted for free by
[Netlify](https://netlify.com), backend hosted for free by
[PythonAnywhere](https://pythonanywhere.com), and both immediately
updated whenever new code is merged to the `master` branch of this
[Github](https://github.com) repo.

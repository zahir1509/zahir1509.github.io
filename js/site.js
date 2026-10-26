(function () {
	'use strict';

	var root = document.documentElement;

	// Theme toggle (dark is the default, applied by the inline script in <head>)
	var toggle = document.getElementById('theme-toggle');
	var applyTheme = function (theme) {
		root.setAttribute('data-theme', theme);
		if (toggle) {
			toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
		}
	};
	applyTheme(root.getAttribute('data-theme') || 'dark');
	if (toggle) {
		toggle.addEventListener('click', function () {
			var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
			applyTheme(next);
			try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
		});
	}

	// Mobile menu
	var burger = document.querySelector('.nav-burger');
	var links = document.querySelector('.nav-links');
	var closeMenu = function () {
		links.classList.remove('open');
		burger.setAttribute('aria-expanded', 'false');
	};
	burger.addEventListener('click', function () {
		var open = links.classList.toggle('open');
		burger.setAttribute('aria-expanded', open ? 'true' : 'false');
	});
	links.addEventListener('click', function (e) {
		if (e.target.closest('a')) { closeMenu(); }
	});

	// Highlight the nav link of the section in view
	var navLinks = {};
	[].forEach.call(document.querySelectorAll('.nav-links a[href^="#"]'), function (a) {
		navLinks[a.getAttribute('href').slice(1)] = a;
	});
	if ('IntersectionObserver' in window) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) { return; }
				Object.keys(navLinks).forEach(function (id) { navLinks[id].classList.remove('active'); });
				if (navLinks[entry.target.id]) { navLinks[entry.target.id].classList.add('active'); }
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		['hero', 'stats', 'about', 'resume', 'features', 'skills',
			'work', 'cases', 'contact'].forEach(function (id) {
			var el = document.getElementById(id);
			if (el) { spy.observe(el); }
		});
	}

	// Hero terminal typing animation; click anywhere on it to skip
	var term = document.getElementById('hero-term');
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var cursor = document.createElement('span');
	cursor.className = 't-cursor';
	cursor.textContent = '\u2588';
	var shellReady = false;
	var startShell;
	if (term && !reduceMotion) {
		var lines = [].slice.call(term.querySelectorAll('.t-line'));
		var texts = lines.map(function (l) { return l.textContent; });
		var skipped = false;
		var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

		// Lock the final height so the hero does not jump while typing
		term.style.minHeight = term.offsetHeight + 'px';
		lines.forEach(function (l) {
			l.classList.add('t-pending');
			if (!l.classList.contains('t-links')) { l.textContent = ''; }
		});
		term.parentNode.addEventListener('click', function () { skipped = true; });

		var typeLine = function (el, text, delay) {
			var i = 0;
			var step = function () {
				if (skipped) { el.textContent = text; return Promise.resolve(); }
				i += 1;
				el.textContent = text.slice(0, i);
				el.appendChild(cursor);
				if (i >= text.length) { return Promise.resolve(); }
				return sleep(delay + Math.random() * delay * 0.6).then(step);
			};
			return text.length ? step() : Promise.resolve();
		};

		var run = function (index) {
			if (index >= lines.length) { return Promise.resolve(); }
			var el = lines[index];
			el.classList.remove('t-pending');
			el.appendChild(cursor);
			var next = function () { return run(index + 1); };
			if (el.classList.contains('t-cmd')) {
				var isFinal = el.classList.contains('t-final');
				if (isFinal) { return Promise.resolve(); }
				return sleep(skipped ? 0 : 350)
					.then(function () { return typeLine(el, texts[index], 55); })
					.then(function () { return sleep(skipped ? 0 : 300); })
					.then(next);
			}
			if (el.classList.contains('t-out')) {
				return typeLine(el, texts[index], 14).then(next);
			}
			return sleep(skipped ? 0 : 120).then(next);
		};

		sleep(700).then(function () { return run(0); }).then(function () {
			lines.forEach(function (l) { l.classList.remove('t-pending'); });
			lines[lines.length - 1].appendChild(cursor);
			startShell();
		});
	}

	// Once the intro has played, the last prompt accepts commands such as "projects"
	startShell = function () {
		var input = document.getElementById('term-input');
		var finalLine = term && term.querySelector('.t-final');
		if (!input || !finalLine || shellReady) { return; }
		shellReady = true;

		var sections = {
			about: 'about', experience: 'resume', resume: 'resume', stats: 'stats',
			skills: 'skills', projects: 'work', work: 'work', cases: 'cases',
			'case-studies': 'cases', contact: 'contact', acq: 'acq'
		};
		var instagram = 'https://www.instagram.com/anyonecanquiz/';
		var typed = document.createElement('span');
		var hint = document.createElement('span');
		hint.className = 't-hint';
		hint.textContent = 'try: projects, contact, help';

		var render = function () {
			typed.textContent = input.value;
			finalLine.textContent = '';
			finalLine.appendChild(typed);
			finalLine.appendChild(cursor);
			if (!input.value) { finalLine.appendChild(hint); }
		};
		var print = function (text, cls) {
			var line = document.createElement('div');
			line.className = 't-line t-dyn ' + cls;
			line.textContent = text;
			term.insertBefore(line, finalLine);
		};
		var execute = function (raw) {
			var cmd = raw.trim().toLowerCase().replace(/^(cd|goto|open)\s+/, '').replace(/^\.?\//, '').replace(/\/$/, '');
			print(raw, 't-cmd');
			if (!cmd) { return; }
			if (cmd === 'clear') {
				[].slice.call(term.querySelectorAll('.t-dyn')).forEach(function (l) { l.parentNode.removeChild(l); });
				return;
			}
			if (cmd === 'help' || cmd === 'ls' || cmd === '?') {
				print('about  experience  skills  projects  cases  contact  acq  instagram  theme  clear', 't-out');
			} else if (cmd === 'theme') {
				document.getElementById('theme-toggle').click();
				print('theme switched', 't-out');
			} else if (cmd === 'instagram') {
				window.open(instagram, '_blank', 'noopener');
				print('opening @anyonecanquiz ...', 't-out');
			} else if (sections[cmd] && document.getElementById(sections[cmd])) {
				print('jumping to ' + cmd + ' ...', 't-out');
				document.getElementById(sections[cmd]).scrollIntoView({ behavior: 'smooth' });
			} else {
				print(cmd.split(' ')[0] + ': command not found. try: help', 't-out');
			}
			var dyn = term.querySelectorAll('.t-dyn');
			for (var i = 0; i < dyn.length - 10; i += 1) { dyn[i].parentNode.removeChild(dyn[i]); }
		};

		input.addEventListener('input', render);
		input.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				var value = input.value;
				input.value = '';
				execute(value);
				render();
			} else if (e.key === 'Escape') {
				input.blur();
			}
		});
		term.parentNode.addEventListener('click', function (e) {
			if (!e.target.closest('a')) { input.focus({ preventScroll: true }); }
		});

		// Start typing anywhere while the hero is on screen
		var heroVisible = true;
		var hero = document.getElementById('hero');
		if (hero && 'IntersectionObserver' in window) {
			new IntersectionObserver(function (entries) {
				heroVisible = entries[0].isIntersecting;
			}, { threshold: 0.25 }).observe(hero);
		}
		document.addEventListener('keydown', function (e) {
			if (!heroVisible || e.ctrlKey || e.metaKey || e.altKey) { return; }
			var t = e.target;
			if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
			if (e.key.length === 1 && (e.key !== ' ' || input.value)) { input.focus({ preventScroll: true }); }
		});

		render();
	};
	if (term && reduceMotion) { startShell(); }

	// Scroll progress bar under the nav
	var progress = document.getElementById('scroll-progress-bar');
	if (progress) {
		var ticking = false;
		var updateProgress = function () {
			var max = document.documentElement.scrollHeight - window.innerHeight;
			progress.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
			ticking = false;
		};
		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; window.requestAnimationFrame(updateProgress); }
		}, { passive: true });
		updateProgress();
	}

	// Stats strip: count up once when scrolled into view
	var stats = [].slice.call(document.querySelectorAll('.stat-num[data-count]'));
	var showStat = function (el, value) {
		var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
		el.textContent = value.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) +
			(el.getAttribute('data-suffix') || '');
	};
	if (stats.length && 'IntersectionObserver' in window && !reduceMotion) {
		var countUp = function (el) {
			var target = parseFloat(el.getAttribute('data-count'));
			var duration = 1400;
			var start = null;
			var step = function (ts) {
				if (start === null) { start = ts; }
				var t = Math.min((ts - start) / duration, 1);
				showStat(el, target * (1 - Math.pow(1 - t, 3)));
				if (t < 1) { window.requestAnimationFrame(step); }
			};
			window.requestAnimationFrame(step);
		};
		var statObserver = new IntersectionObserver(function (entries, obs) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) { return; }
				obs.unobserve(entry.target);
				countUp(entry.target);
			});
		}, { threshold: 0.6 });
		stats.forEach(function (el) { showStat(el, 0); statObserver.observe(el); });
	}

	// Contact form: send in the background and show a thank-you message
	var form = document.getElementById('contact-form');
	var formStatus = document.getElementById('form-status');
	if (form && formStatus && window.fetch) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var button = form.querySelector('input[type="submit"]');
			button.disabled = true;
			button.value = 'Sending...';
			formStatus.className = 'form-status';
			formStatus.textContent = '';
			fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
				.then(function (res) { return res.json(); })
				.then(function (data) {
					if (!data.success) { throw new Error(data.message || 'failed'); }
					form.reset();
					formStatus.className = 'form-status ok';
					formStatus.textContent = 'Thanks! Your message is on its way, and I will reply soon.';
				})
				.catch(function () {
					formStatus.className = 'form-status err';
					formStatus.textContent = 'That did not go through. Email me directly at zahirali1509@gmail.com.';
				})
				.then(function () {
					button.disabled = false;
					button.value = 'Send Message';
				});
		});
	}
}());

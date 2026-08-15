(function () {
  var root = document.documentElement;
  var storageKey = 'mdweb-color-scheme';
  var toggle;
  var toggleMobile;
  var labelNode;

  function randomPairColor () {
    // 随机色相（0-360）
    const hue = Math.floor(Math.random() * 360);
    // 同一色相下生成两种亮度
    const bg = `hsl(${hue}, 70%, 80%)`;  // 浅色背景
    const text = `hsl(${hue}, 80%, 25%)`; // 深色文字
    return { bg, text };
  }

  document.querySelectorAll('.summary-meta span').forEach(tag => {
    const { bg, text } = randomPairColor();
    tag.style.backgroundColor = bg;
    tag.style.color = text;
    tag.querySelectorAll('a').forEach(a => {
      a.style.color = text;
    });
  });
  function readStored () {
    try {
      return localStorage.getItem(storageKey) || 'light';
    } catch (error) {
      return 'light';
    }
  }

  function writeStored (value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) { }
  }

  function applyTheme (theme) {
    root.dataset.themeChoice = theme;
    root.dataset.theme = theme;

    // 更新切换按钮状态
    if (toggle) {
      toggle.checked = theme === 'dark';
      toggle.setAttribute('aria-label', '切换主题，当前：' + (theme === 'light' ? '浅色模式' : '深色模式'));
    }
    if (toggleMobile) {
      toggleMobile.checked = theme === 'dark';
      toggleMobile.setAttribute('aria-label', '切换主题，当前：' + (theme === 'light' ? '浅色模式' : '深色模式'));
    }
    if (labelNode) {
      labelNode.textContent = theme === 'light' ? '浅色模式' : '深色模式';
    }

    // 强制更新所有主题切换按钮的状态
    var allToggles = document.querySelectorAll('[data-theme-toggle], [data-theme-toggle-mobile]');
    allToggles.forEach(function (toggleElement) {
      toggleElement.checked = theme === 'dark';
    });
  }

  function toggleTheme () {
    var currentTheme = root.dataset.theme || readStored();
    var newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('主题切换:', currentTheme, '->', newTheme); // 调试信息
    applyTheme(newTheme);
    writeStored(newTheme);
  }

  // 将toggleTheme函数暴露到全局作用域，供onclick使用
  window.toggleTheme = toggleTheme;

  // 返回顶部功能
  function initBackToTop () {
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
      // 滚动检测
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      });

      // 返回顶部点击事件
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // 移动端抽屉菜单功能
  function initMobileDrawer () {
    var menuButton = document.getElementById('mobile-menu-button');
    var drawer = document.getElementById('mobile-drawer');
    var overlay = document.getElementById('mobile-drawer-overlay');
    var closeButton = document.getElementById('mobile-drawer-close');

    // 动态调整抽屉高度，解决移动端浏览器地址栏问题
    function adjustDrawerHeight () {
      if (drawer) {
        // 使用window.innerHeight获取实际可视区域高度
        var actualHeight = window.innerHeight;
        drawer.style.height = actualHeight + 'px';
        drawer.style.maxHeight = actualHeight + 'px';
      }
    }

    function openDrawer () {
      // 打开抽屉前先调整高度
      adjustDrawerHeight();

      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      // 抽屉打开时重新绑定主题切换事件
      setTimeout(function () {
        bindThemeEvents();
      }, 50);
    }

    function closeDrawer () {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (menuButton) {
      menuButton.addEventListener('click', openDrawer);
    }

    if (closeButton) {
      closeButton.addEventListener('click', closeDrawer);
    }

    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }

    // 点击抽屉内的链接时关闭抽屉
    var drawerLinks = drawer.querySelectorAll('.nav-link');
    drawerLinks.forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    // 监听窗口大小变化，动态调整抽屉高度
    window.addEventListener('resize', function () {
      if (drawer && drawer.classList.contains('open')) {
        adjustDrawerHeight();
      }
    });

    // 页面加载时初始化抽屉高度
    setTimeout(function () {
      adjustDrawerHeight();
    }, 100);
  }

  function bindThemeEvents () {
    // 重新查找元素（防止动态创建的元素）
    toggle = document.querySelector('[data-theme-toggle]');
    toggleMobile = document.querySelector('[data-theme-toggle-mobile]');
    labelNode = document.querySelector('[data-theme-label]');

    // 绑定切换事件 - 只绑定change事件，避免重复触发
    if (toggle && !toggle.hasAttribute('data-event-bound')) {
      toggle.addEventListener('change', function () {
        toggleTheme();
      });
      toggle.setAttribute('data-event-bound', 'true');
    }

    if (toggleMobile && !toggleMobile.hasAttribute('data-event-bound')) {
      toggleMobile.addEventListener('change', function () {
        toggleTheme();
      });
      toggleMobile.setAttribute('data-event-bound', 'true');
    }
  }

  // 简单的导航区域显示控制（用于服务器端渲染的导航）
  function initPostNavigation () {
    const navigation = document.getElementById('post-navigation');
    if (!navigation) return;

    const hasPrev = navigation.querySelector('.prev-link');
    const hasNext = navigation.querySelector('.next-link');
    // 如果只有一个导航链接，设置整行显示
    if ((hasPrev && !hasNext) || (!hasPrev && hasNext)) {
      navigation.style.gridTemplateColumns = '1fr';
    }
  }

  // 移动端电话点击事件处理
  function initPhoneLinks () {
    // 只在移动端添加电话点击功能
    if (window.innerWidth <= 768) {
      var phoneElements = document.querySelectorAll('.contact-phone');

      phoneElements.forEach(function (phoneElement) {
        // 获取电话号码
        var phoneNumber = phoneElement.textContent.trim();

        // 添加点击事件
        phoneElement.addEventListener('click', function () {
          // 使用tel:协议拨打电话
          window.location.href = 'tel:' + phoneNumber;
        });

        // 添加触摸事件支持
        phoneElement.addEventListener('touchstart', function (e) {
          e.preventDefault();
          this.style.transform = 'scale(0.95)';
        });

        phoneElement.addEventListener('touchend', function (e) {
          e.preventDefault();
          this.style.transform = 'scale(1)';
          window.location.href = 'tel:' + phoneNumber;
        });
      });
    }
  }

  function init () {
    // 初始化主题 - 优先使用已设置的主题，否则使用存储的主题
    var currentTheme = root.dataset.theme || readStored();
    applyTheme(currentTheme);

    // 绑定主题切换事件
    bindThemeEvents();

    // 初始化移动端抽屉菜单
    initMobileDrawer();

    // 初始化电话链接功能
    initPhoneLinks();

    // 初始化返回顶部功能
    initBackToTop();

    // 初始化文章导航功能
    initPostNavigation();

    // 延迟再次绑定事件，确保所有元素都已加载
    setTimeout(function () {
      bindThemeEvents();
      // 确保主题状态正确应用
      var finalTheme = root.dataset.theme || readStored();
      applyTheme(finalTheme);

      // 重新初始化电话链接（防止动态加载的内容）
      initPhoneLinks();
      // 重新初始化文章导航（确保DOM完全加载）
      initPostNavigation();
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  try {
    const viewer = new Viewer(document.getElementById("post-content"), {
      toolbar: true, // 显示工具栏
      title: true,   // 显示标题
      navbar: true,  // 显示缩略图导航
      movable: true, // 允许拖拽
      zoomable: true,// 允许缩放
      rotatable: true,// 允许旋转
      scalable: true, // 允许翻转
      transition: true,
    });
  } catch (error) { }
})();
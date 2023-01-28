$(function () {
  var $gallery = $("#gallery"),
    $todolist = $("#todolist");

  $('.add-btn').on('click', (e) => {
    postData('http://localhost:3000/create', {
      'id': '',
      'content': $('.task-text').val(),
      'location': 'gallery'
    })
    .then(data => {
      addTask(data); 
      console.log(data);
    });
  });

  function addTask(data) {
    let li = $(`<li class="ui-widget-content ui-corner-tr" data-task="${data.id}"><p>${data.content}</p><br></li>`);
    li.draggable({
      cancel: "a.ui-icon", // clicking an icon won't initiate dragging
      revert: "invalid", // when not dropped, the item will revert back to its initial position
      containment: "document",
      helper: "clone",
      cursor: "move"
    }).appendTo($('#gallery'));
    $('.task-text').val('');
    let trash = $('<i class="fa-solid fa-trash"></i>');
    li.append(trash);
    trash.on('click', (e) => {
      removeData('http://localhost:3000/delete', {
        id: e.target.parentElement.getAttribute('data-task')
      })
      .then(res => {
        e.target.parentElement.remove();
        console.log(res.message);
      });
    });
  }

  // Let the gallery items be draggable
  $("li", $gallery).draggable({
    cancel: "a.ui-icon", // clicking an icon won't initiate dragging
    revert: "invalid", // when not dropped, the item will revert back to its initial position
    containment: "document",
    helper: "clone",
    cursor: "move"
  });

  // Let the trash be droppable, accepting the gallery items
  $todolist.droppable({
    accept: "#gallery > li",
    classes: {
      "ui-droppable-active": "ui-state-highlight"
    },
    drop: function (event, ui) {
      deleteTask(ui.draggable);
      updateData('http://localhost:3000/update', {
        id: ui.draggable[0].getAttribute('data-task'), 
        location: 'todolist'
      }).then(res => console.log(res.message));
    }
  });

  // Let the gallery be droppable as well, accepting items from the trash
  $gallery.droppable({
    accept: "#todolist li",
    classes: {
      "ui-droppable-active": "custom-state-active"
    },
    drop: function (event, ui) {
      recycleTask(ui.draggable);
      updateData('http://localhost:3000/update', {
        id: ui.draggable[0].getAttribute('data-task'), 
        location: 'gallery'
      }).then(res => console.log(res.message));
    }
  });

  // Image deletion function
  function deleteTask($item) {
    $item.fadeOut(function () {
      var $list = $("ul", $todolist).length ?
        $("ul", $todolist) :
        $("<ul class='gallery ui-helper-reset'/>").appendTo($todolist);

      $item.appendTo($list).fadeIn();
    });
  }

  // Image recycle function
  function recycleTask($item) {
    $item.fadeOut(function () {
      $item
        .appendTo($gallery)
        .fadeIn();
    });
  }

  // COMMUNICATION WITH SERVER AND MONGODB

  async function removeData(url, data) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async function updateData(url, data) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async function postData(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  async function getData(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  getData('http://localhost:3000/getTasks')
  .then(tasks => {
    tasks.forEach(task => {
      let location = $gallery
      if (task.location == "todolist") {
        location = $todolist;
      }
      $(`<li class="ui-widget-content ui-corner-tr" data-task="${task.id}"><p>${task.content}</p><br><i class="fa-solid fa-trash"></i></li>`).draggable({
        cancel: "a.ui-icon", // clicking an icon won't initiate dragging
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: "clone",
        cursor: "move"
      }).appendTo(location);
    });
    $('i').on('click', (e) => {
      removeData('http://localhost:3000/delete', {
        id: e.target.parentElement.getAttribute('data-task')
      })
      .then(res => {
        e.target.parentElement.remove();
        console.log(res.message);
      });
    });
  });
});
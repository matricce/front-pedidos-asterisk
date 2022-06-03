$(document).ready(function () {
  function addOptions(id) {
    const tableColumn = document.createElement("td")
    const editButton = document.createElement("a")
    const iconEdit = document.createElement("i")
    const deleteButton = document.createElement("a")
    const iconDelete = document.createElement("i")
    editButton.setAttribute("data-id", id)
    editButton.href = `#editOrderModal`
    editButton.className = "edit"
    editButton.setAttribute("data-toggle", "modal")
    iconEdit.className = "material-icons"
    iconEdit.innerHTML = "&#xE254;"
    iconEdit.title = "Editar"
    iconEdit.setAttribute("data-toggle", "tooltip")
    editButton.appendChild(iconEdit)

    deleteButton.setAttribute("data-id", id)
    deleteButton.href = `#deleteOrderModal`
    deleteButton.className = "delete"
    deleteButton.setAttribute("data-toggle", "modal")
    iconDelete.className = "material-icons"
    iconDelete.innerHTML = "&#xE872;"
    iconDelete.title = "Deletar"
    iconDelete.setAttribute("data-toggle", "tooltip")
    deleteButton.appendChild(iconDelete)

    tableColumn.appendChild(editButton)
    tableColumn.appendChild(deleteButton)

    return tableColumn
  }

  function addStatus(status) {
    const tableColumn = document.createElement("td")
    const divStatus = document.createElement("div")
    const spanStatus = document.createElement("span")
    divStatus.classList.add("order-status")
    const labels = {
      open: "label-success",
      closed: "label-danger",
      estimating: "label-warning",
      planning: "label-warning",
      producing: "label-warning",
      delivering: "label-warning",
    }
    divStatus.classList.add(labels[status.code])
    divStatus.setAttribute("data-value", status.id)
    spanStatus.innerHTML = status.code
    divStatus.appendChild(spanStatus)
    tableColumn.appendChild(divStatus)

    return tableColumn
  }

  function addDate(date) {
    const tableColumn = document.createElement("td")
    const dia = new Date(date)
    tableColumn.innerHTML = `${dia.toLocaleDateString("pt-BR", {
      dateStyle: "short",
    })}`
    return tableColumn
  }

  function fillTable(data) {
    const table = $(".table")
    table.find("tbody").empty()
    $.each(data, function (key, value) {
      var row = $("<tr>")
      row.append($("<td>").text(value.name))
      row.append($("<td>").text(value.number))
      row.append(addDate(value.createdAt))
      row.append(addStatus(value.statusId))
      row.append(addOptions(value.id))
      table.find("tbody").append(row)
    })
    $('[data-toggle="tooltip"]').tooltip()
    $(".edit").click(function () {
      const order = {
        name: $(this).parent().parent().find("td:nth-child(1)").text(),
        status: $(this).parent().parent().find(".order-status").data("value"),
        number: $(this).parent().parent().find("td:nth-child(2)").text(),
      }
      $("#editOrderModal").val(order)
    })
    $(".delete").click(function () {
      $("#deleteOrderModal").val($(this).data("id"))
    })
  }

  function renderPages(meta) {
    const pages = $(".pagination")
    pages.empty()
    const min = meta.currentPage - 1 > 0 ? meta.currentPage - 1 : 1
    const max = meta.totalPages > min + 2 ? min + 2 : meta.totalPages
    const previous = document.createElement("li")
    const next = document.createElement("li")
    previous.className = "page-item"
    next.className = "page-item"
    const previousLink = document.createElement("a")
    const nextLink = document.createElement("a")
    previousLink.className = "page-link"
    nextLink.className = "page-link"
    previousLink.innerHTML = "Anterior"
    previousLink.href = "#"
    nextLink.innerHTML = "Próximo"
    nextLink.href = "#"
    previous.appendChild(previousLink)
    next.appendChild(nextLink)
    pages.append(previous)
    for (let i = min; i <= max; i++) {
      const page = document.createElement("li")
      const link = document.createElement("a")
      page.classList.add("page-item")
      link.href = "#"
      link.innerHTML = i
      link.classList.add("page-link")
      if (i === meta.currentPage) {
        page.classList.add("active")
      }
      page.appendChild(link)
      $(".pagination").append(page)
    }
    pages.append(next)
  }

  function getData(page, limit) {
    $.ajax({
      url: `http://localhost:3333/api/v1/order/list?page=${page}&limit=${limit}`,
      type: "GET",
      dataType: "json",
      success: function (data) {
        fillTable(data.data)
        $(".pagination").val(data.meta)
        const first = (data.meta.currentPage - 1) * data.meta.itemsPerPage + 1
        const last =
          data.meta.currentPage * data.meta.itemsPerPage > data.meta.totalItems
            ? data.meta.totalItems
            : data.meta.currentPage * data.meta.itemsPerPage
        $(".hint-text").text(
          `Mostrando ${first} a ${last} de ${data.meta.totalItems} registros`
        )
        renderPages(data.meta)
      },
    })
  }

  function submitAddForm() {
    $.ajax({
      type: "POST",
      url: `http://localhost:3333/api/v1/order`,
      data: JSON.stringify({
        name: $("#addOrderModal").find('[data-form="name"]').val(),
        statusId: Number(
          $("#addOrderModal").find('[data-form="status"]').val()
        ),
      }),
      success: function (response) {
        getData(1, 10)
      },
      error: function () {
        alert("Error")
      },
      contentType: "application/json",
      dataType: "json",
    })
  }

  function submitUpdateForm(id) {
    $.ajax({
      type: "PUT",
      url: `http://localhost:3333/api/v1/order/id/${id}`,
      cache: false,
      data: JSON.stringify({
        name: $("#editOrderModal").find('[data-form="name"]').val(),
        statusId: Number(
          $("#editOrderModal").find('[data-form="status"]').val()
        ),
      }),
      success: function (response) {
        getData(1, 10)
      },
      error: function () {
        alert("Error")
      },
      contentType: "application/json",
      dataType: "json",
    })
  }

  function submitDeleteForm(id) {
    $.ajax({
      type: "DELETE",
      url: `http://localhost:3333/api/v1/order/id/${id}`,
      cache: false,
      success: function (response) {
        getData(1, 10)
      },
      error: function () {
        alert("Error")
      },
    })
  }

  $("#addOrderModal").on("show.bs.modal", function () {
    $("#addOrderModal").find('[data-form="name"]').val("")
    $("#addOrderModal").find('[data-form="status"]').val("")
  })

  $("#editOrderModal").on("show.bs.modal", function () {
    $("#editOrderModal .modal-title").html(
      `Editar pedido <b>Número ${$("#editOrderModal").val().number}</b>`
    )
    $("#editOrderModal")
      .find('[data-form="name"]')
      .val($("#editOrderModal").val().name)
    $("#editOrderModal")
      .find('[data-form="status"]')
      .val($("#editOrderModal").val().status)
  })

  $("#deleteOrderModal").on("show.bs.modal", function () {
    $("#deleteOrderModal .modal-title").html(
      `Deletar pedido <b>Número ${$("#deleteOrderModal").val()}</b>`
    )
  })

  $("#addOrderModal").submit(function () {
    submitAddForm($("#addOrderModal").val())
    $("#addOrderModal").modal("hide")
  })

  $("#editOrderModal").submit(function () {
    submitUpdateForm($("#editOrderModal").val().number)
    $("#editOrderModal").modal("hide")
  })

  $("#deleteOrderModal").submit(function () {
    submitDeleteForm($("#deleteOrderModal").val())
    $("#deleteOrderModal").modal("hide")
  })

  getData(1, 10)

  $(".pagination").on("click", "li a", function (e) {
    e.preventDefault()
    const pagination = $(".pagination").val()
    if (!isNaN(Number($(this).text()))) {
      const page = $(this).text()
      getData(page, 10)
    } else {
      const page =
        $(this).text() === "Anterior"
          ? pagination.currentPage - 1
          : pagination.currentPage + 1 > pagination.totalPages
          ? pagination.currentPage
          : pagination.currentPage + 1
      getData(page, 10)
    }
  })
})

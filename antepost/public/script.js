const handleDelete = id => {
    fetch(`/tasks/${id}`, { method: 'delete' })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'Success') {
                window.location = data.redirect;
            }
        });
};

const handleDeleteAllHistory = () => {
    fetch('/tasks/history', { method: 'delete' })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'Success') {
                window.location = data.redirect;
            }
        });
};

const handleFilterDocuments = () => {
    const id = $("#filter option:selected").text();
    const trs = $('.history-table tbody tr');

    if (id === 'All') {
        trs.each(function () {
            $(this).removeClass('hidden');
        });
        $('h1 span').text('all tasks');
    } else {
        trs.each(function () {
            if ($(this).children().first().text() !== id) {
                $(this).addClass('hidden');
            } else {
                $(this).removeClass('hidden');
            }
        });
        $('h1 span').text(`'${id}' task`);
    }
};

const container = document.querySelector('.tasks__container');

/**
 * функция обработчик удаления события
 * @param { EventTarget } target
 * @return { void }
 **/
async function handleDelete(target) {
  const { dataset: { id } } = target;

  try {
    const { status } = await fetch('/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if ( status !== 200 ) {
      throw new Error('Deleting error');
    }

    target.parentNode.parentNode.remove();
  } catch (error) {
    console.error( error )
  }
}

/**
 * функция обработчик удаления события
 * @param { EventTarget } target
 * @return { void }
 **/
async function handleToggleStatus( target ) {
  const { dataset: { id } } = target;

  console.log( target.checked )

  try {
    const res = await fetch(`/tasks/${ id }`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: target.checked 
      })
    });
    const requestBody = await res.json();

    if ( res.status !== 200 ) {
      console.warn( requestBody );
      throw new Error('Swithcing status error');
    }
    target.value = requestBody;
  } catch (error) {
    console.error( error )
  }
}

/** переход на страницу указаную в дата атрибуте */
function handleChangeLocation(target) {
  const { dataset: { href } } = target;
  location.href = href;
}

if ( container ) {
  container.addEventListener('click', (event) => {
    const { dataset: { mode } } = event.target;

    switch ( mode ) {
      case 'update': {
        handleChangeLocation( event.target );
        return;
      }
      case 'delete': {
        handleDelete( event.target );
        return;
      }
      case 'check': {
        handleToggleStatus( event.target );
        return;
      }
      default: {
        return;
      }
    }
  });
}
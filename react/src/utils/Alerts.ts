import Swal from 'sweetalert2';

export const showAlert = {
  success: (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      timerProgressBar: true,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      customClass: {
        popup: 'text-sm py-3 px-4',
        title: 'text-base',
        icon: 'w-8 h-8'
      }
    });
  },

  error: (title: string, text: string = '') => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      timer: 2000,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      customClass: {
        popup: 'text-sm py-3 px-4',
        title: 'text-base',
        icon: 'w-8 h-8'
      }
    });
  },

  loading: (title: string = 'Chargement...') => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'text-sm py-3 px-4',
        title: 'text-base'
      }
    });
  },

  confirm: (title: string, text: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'text-sm',
        title: 'text-base'
      }
    });
  }
};
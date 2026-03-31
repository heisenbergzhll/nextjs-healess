import { useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import ADD_SELLER_REVIEW from '@voguish/module-marketplace/graphql/mutation/AddSellerReviews.graphql';
import { RightIcon } from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Modal from '@voguish/module-theme/components/Modal';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import RatingInputField from '@voguish/module-theme/components/ui/Form/Elements/Rating';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ChangeEvent } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
const RotateRight = dynamic(() => import('@mui/icons-material/RotateRight'));

const AddReviewForm = ({ submitReview, open, setOpen }: any) => {
  const {
    setValue,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const token = useToken();
  const router = useRouter();

  const handleRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // Get the new value from the event
    setValue('feed_quality', newValue ? Number(newValue) * 20 : 0); // Update the form state with the new value
  };
  const { t } = useTranslation('common');

  const handlePriceRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // Get the new value from the event
    setValue('feed_price', newValue ? Number(newValue) * 20 : 0); // Update the form state with the new value
  };
  const handleValueRatingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // Get the new value from the event
    setValue('feed_value', newValue ? Number(newValue) * 20 : 0); // Update the form state with the new value
  };
  const userName = useSelector((state: RootState) => state?.user?.name);

  const userEmail = useSelector((state: RootState) => state?.user?.email);

  const [addReview] = useMutation(ADD_SELLER_REVIEW);
  const { showToast } = useToast();

  const submitReviewHandler = async (data: FieldValues) => {
    if (token) {
      data['buyer_email'] = userEmail;

      try {
        await addReview({
          context: {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          },
          variables: {
            feedback: data,
            sellerId: submitReview,
          },
        });
        showToast({ message: 'Review Added Successfully !' });
        reset();
        setOpen(false);
      } catch (err: any) {
        showToast({ message: `${err?.message}`, type: 'error' });
        setOpen(false);
      }
    } else {
      router?.push('customer/account/login');
    }
  };
  return (
    <ErrorBoundary>
      <Modal
        showModal={open}
        hideModal={() => setOpen(false)}
        title={
          <ErrorBoundary>
            {' '}
            <span
              className="flex cursor-pointer sm:hidden"
              onClick={() => setOpen(false)}
            >
              <RightIcon />
            </span>{' '}
            {t('Add Your Review')}
          </ErrorBoundary>
        }
      >
        <form
          className="h-full mt-4 -sm:mb-4 -sm:px-6"
          onSubmit={handleSubmit(submitReviewHandler)}
        >
          <FormGroup className="grid content-between" sx={{ mt: 1 }}>
            <div>
              <Box className="flex flex-wrap gap-5 pb-6">
                <RatingInputField
                  label={t('Price')}
                  id="price-rating"
                  {...register('feed_price', {
                    value: 0,
                    onChange: handlePriceRatingChange,
                  })}
                />
                <RatingInputField
                  label={t('Quality')}
                  id="quality-rating"
                  {...register('feed_quality', {
                    value: 0,
                    onChange: handleRatingChange,
                  })}
                />
                <RatingInputField
                  label={t('Value')}
                  id="value-rating"
                  {...register('feed_value', {
                    value: 0,
                    onChange: handleValueRatingChange,
                  })}
                />
              </Box>

              <InputField
                label={t('Nickname')}
                {...register('feed_nickname', {
                  required: t('* Nickname is required'),
                })}
                type="text"
                className="mb-2"
                placeHolder={t('Enter your nickName')}
                defaultValue={userName || ''}
                error={errors?.feed_nickname?.message ? true : false}
                helperText={
                  errors?.feed_nickname ? errors?.feed_nickname?.message : ''
                }
              />
              <InputField
                label={t('Summary')}
                {...register('feed_summary', {
                  required: t('* Summary is required'),
                })}
                type="text"
                className="mb-2"
                placeHolder={t('Enter review summary')}
                error={errors?.feed_summary?.message ? true : false}
                helperText={
                  errors?.feed_summary ? errors?.feed_summary?.message : ''
                }
              />

              <div className="grid">
                <label className="pb-1 text-[1rem]" htmlFor="text">
                  {t('Feedback')}
                </label>
                <TextField
                  multiline
                  rows={2}
                  placeholder={t('Review Description')}
                  type="text"
                  error={errors?.text ? true : false}
                  {...register('feed_review')}
                />
              </div>
            </div>
            <Grid className="flex items-center justify-end gap-6 sm:py-4 -sm:mt-8">
              <Button
                className="float-left mr-5 hidden w-32 rounded-[unset] border border-solid border-darkGreyBackground text-darkGreyBackground hover:border-darkBackground hover:bg-darkBackground hover:text-white sm:flex md:float-right md:w-40 lg:float-right lg:w-40 xl:float-right xl:w-40"
                variant="outlined"
                onClick={() => setOpen(false)}
              >
                {t('Cancel')}
              </Button>

              {isSubmitting ? (
                <Button
                  className="w-full rounded-[unset] shadow-[unset] sm:w-32 md:w-40 lg:w-40 xl:w-40"
                  variant="contained"
                  type="submit"
                >
                  <span className="flex items-center h-full ltr:pr-2 rtl:pl-2">
                    <RotateRight className="w-5 h-5 animate-spin" />
                  </span>
                  {t('Sending...')}
                </Button>
              ) : (
                <Button
                  className="w-full rounded-[unset] shadow-[unset] sm:w-32 md:w-40 lg:w-40 xl:w-40"
                  variant="contained"
                  type="submit"
                >
                  {t('Submit')}
                </Button>
              )}
            </Grid>
          </FormGroup>
        </form>
      </Modal>
    </ErrorBoundary>
  );
};
export default AddReviewForm;
